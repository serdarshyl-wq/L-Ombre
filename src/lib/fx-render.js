import gsap from "gsap";

/**
 * CGI/VFX satırının imza hover'ı: imleç render kafasıdır.
 *
 * Bantta üç boş kadraj duruyor — çözülmeyi bekleyen kareler. İmleç bir render
 * bucket'ı: üstünden geçtiği kutucuk çözülüyor, görüntünün o parçası ortaya
 * çıkıyor ve öyle kalıyor. İmleç durunca renderer devralıp kalanları kendi
 * bitiriyor. Arnold, V-Ray, mental ray — hepsinde ekranda görülen şey budur.
 *
 * Kareler stüdyonun kendi işlerinden, gri tonda. Önce soyut bir tonlama
 * çözülüyordu: "bir şey çözülüyor" hissi vardı ama "ne çözülüyor" cevabı
 * yoktu, yani ödül yoktu. Gerçek kare belirince soru ortadan kalkıyor ve
 * satır aynı zamanda işi gösteriyor.
 *
 * Neden ÜÇ kadraj: bant 6.7:1. Tek bir 16:9 kareyi bandın tamamına yaymayı
 * denedik — ortadan ince bir şerit kalıyor, ne olduğu anlaşılmıyordu. Kadrajı
 * kendi oranında bırakınca bandın yüksekliğinde 238px yer kaplıyor; yan yana
 * üç tanesi bandı dolduruyor. Üstelik bu hâli bir kontakt föye benziyor —
 * render çiftliğinde tam olarak öyle görünür.
 *
 * Görüntüler ilk hover'a kadar indirilmiyor: ana yüklemede dekoratif
 * fotoğrafların bedeli yok.
 *
 * Maliyet: neredeyse sıfır. Kutucuğun çözülmesi tek seferlik bir durum
 * değişimi, sönümü CSS geçişi yapıyor — kare başına JS yazımı yok. Döngü
 * sadece imleç durduğunda ve yalnızca zaman sayacı için dönüyor.
 */

const AR = 16 / 9; // kadraj oranı
const GAP = 18; // px — kadrajlar arası boşluk
const ROWS = 4; // bir kadrajdaki kutucuk sırası
const FADE = 0.42; // sn — bir bucket'ın çözünme süresi
const IDLE = 240; // ms — imleç bu kadar durunca render devralıyor
const STEP = 65; // ms — otomatik ilerlerken kutucuk başına süre
const INK = 0.58; // çözülmüş kutucuğun opaklığı
const EDGE = 0.16; // boş kadrajın çerçeve opaklığı

const SVG_NS = "http://www.w3.org/2000/svg";

export function mountRenderFx(host, { still = false } = {}) {
  const sources = (host.dataset.frames || "").split(",").filter(Boolean);

  let tiles = []; // { el, frame, col, row }
  let frames = []; // { x, w, h, src, art }
  let done = [];
  let cols = 0;
  let tw = 0;
  let th = 0;

  let head = -1;
  let lastMove = 0;
  let clock = 0;
  let running = false;
  let frozen = false; // hareket azaltma: kareler hep çözülmüş duruyor
  let lastW = 0;
  let lastH = 0;

  // Kareler gri tonda: palet obsidyen ve kemik, fotoğraf o düzeni bozmasın.
  // Filtre kutucuklara değil kaba uygulanıyor — yüzlerce filtre pahalı olurdu.
  host.style.filter = "grayscale(1) contrast(1.06)";

  // Aktif bucket: köşe braketleri. Renderer'ın ekranda çizdiği çerçevenin ta
  // kendisi — dolu bir kutu değil, dört köşe.
  const bucket = document.createElementNS(SVG_NS, "svg");
  bucket.setAttribute("fill", "none");
  bucket.setAttribute("stroke", "currentColor");
  bucket.setAttribute("stroke-width", "1");
  bucket.setAttribute("class", "absolute top-0 left-0 overflow-visible");
  const brackets = document.createElementNS(SVG_NS, "path");
  bucket.appendChild(brackets);
  bucket.style.opacity = "0";
  // Kutucuktan kutucuğa sıçrıyor: renderer da öyle atlar, süzülmez.
  bucket.style.transition = "transform 0.1s linear, opacity 0.2s ease";

  /**
   * Görüntünün kutucuklara dağıtılması. Her kutucuk kendi kadrajının
   * görüntüsüne açılan bir pencere; görüntü kadraja `cover` ile oturuyor,
   * kutucuk da onu kendi konumu kadar kaydırıyor. Hepsi çözüldüğünde ortada
   * dikişsiz tek bir kare kalıyor — mozaik yalnızca yarım kalmışken görünüyor,
   * gerçek bir render'da olduğu gibi.
   */
  const dress = (f) => {
    if (!f.art) return;
    const scale = Math.max(f.w / f.art.w, f.h / f.art.h);
    const iw = f.art.w * scale;
    const ih = f.art.h * scale;
    const ox = (f.w - iw) / 2;
    const oy = (f.h - ih) / 2;

    for (const t of tiles) {
      if (t.frame !== f) continue;
      t.el.style.backgroundImage = `url("${f.src}")`;
      t.el.style.backgroundSize = `${iw.toFixed(1)}px ${ih.toFixed(1)}px`;
      t.el.style.backgroundPosition = `${(ox - t.col * tw).toFixed(1)}px ${(oy - t.row * th).toFixed(1)}px`;
    }
  };

  const load = () => {
    for (const f of frames) {
      if (f.art || f.pending) continue;
      f.pending = true;
      const img = new Image();
      img.onload = () => {
        f.art = { w: img.naturalWidth, h: img.naturalHeight };
        dress(f);
      };
      img.src = f.src;
    }
  };

  const build = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h || !sources.length) return;
    lastW = w;
    lastH = h;

    const fw = h * AR;
    const count = Math.max(
      1,
      Math.min(sources.length, Math.floor((w + GAP) / (fw + GAP)))
    );
    const span = count * fw + (count - 1) * GAP;
    const x0 = (w - span) / 2;

    cols = Math.max(1, Math.round(fw / (h / ROWS)));
    tw = fw / cols;
    th = h / ROWS;

    // Yeniden kurulumda daha önce yüklenmiş kareyi tekrar indirmiyoruz.
    const cache = new Map(frames.map((f) => [f.src, f.art]));
    frames = [];
    tiles = [];
    done = [];

    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const f = {
        x: x0 + i * (fw + GAP),
        w: fw,
        h,
        src: sources[i % sources.length],
        art: null,
        pending: false,
      };
      f.art = cache.get(f.src) || null;
      frames.push(f);

      // Boş kadrajın çerçevesi: render başlamadan da bant "üç kare bekliyor"
      // diyor.
      const edge = document.createElement("span");
      edge.className = "absolute";
      edge.style.left = `${Math.round(f.x)}px`;
      edge.style.top = "0px";
      edge.style.width = `${Math.round(fw)}px`;
      edge.style.height = `${h}px`;
      edge.style.border = "1px solid currentColor";
      edge.style.opacity = String(EDGE);
      frag.appendChild(edge);

      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const el = document.createElement("span");
          el.className = "absolute";
          /**
           * Sınırlar tam piksele yuvarlanıyor ve bir sonrakinin başladığı
           * yerde bitiyor. Önce komşuları 1px bindirmiştik — kutucuklar
           * opaklıkla boyandığı için bindirme alfayı ikiye katlıyor ve
           * mozaikte koyu dikişler çıkıyordu.
           */
          const x = Math.round(f.x + c * tw);
          const y = Math.round(r * th);
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          el.style.width = `${Math.round(f.x + (c + 1) * tw) - x}px`;
          el.style.height = `${Math.round((r + 1) * th) - y}px`;
          el.style.opacity = "0";
          el.style.transition = `opacity ${FADE}s ease-out`;
          frag.appendChild(el);
          tiles.push({ el, frame: f, col: c, row: r });
          done.push(false);
        }
      }
    }

    host.replaceChildren(frag, bucket);

    const inset = Math.min(tw, th) * 0.28;
    brackets.setAttribute(
      "d",
      [
        `M0,${inset}L0,0L${inset},0`,
        `M${tw - inset},0L${tw},0L${tw},${inset}`,
        `M${tw},${th - inset}L${tw},${th}L${tw - inset},${th}`,
        `M${inset},${th}L0,${th}L0,${th - inset}`,
      ].join("")
    );
    bucket.setAttribute("width", tw);
    bucket.setAttribute("height", th);

    frames.forEach(dress);

    // Hareket azaltmada kutucuklar hep açık. Bu satır olmadan ResizeObserver'ın
    // kurulumdaki ilk tetiklemesi kareyi yeniden kurup statik durumu siliyordu
    // — ölçtük, `reduce` kipinde hiçbir kutucuk görünmüyordu.
    if (frozen) paintAll();
  };

  const paintAll = () => {
    for (const t of tiles) {
      t.el.style.transition = "none";
      t.el.style.opacity = String(INK);
    }
    done.fill(true);
  };

  const moveBucket = (i) => {
    head = i;
    const t = tiles[i];
    bucket.style.transform = `translate(${(t.frame.x + t.col * tw).toFixed(1)}px, ${(t.row * th).toFixed(1)}px)`;
  };

  const solve = (i) => {
    if (i < 0 || i >= tiles.length || done[i]) return;
    done[i] = true;
    tiles[i].el.style.opacity = String(INK);
  };

  // İmleç kadrajların arasındaysa -1: boşlukta render olmuyor.
  const indexAt = (e) => {
    const b = host.getBoundingClientRect();
    const x = e.clientX - b.left;
    const r = Math.floor((e.clientY - b.top) / th);
    if (r < 0 || r >= ROWS) return -1;

    for (let i = 0; i < frames.length; i += 1) {
      const f = frames[i];
      if (x < f.x || x >= f.x + f.w) continue;
      const c = Math.min(cols - 1, Math.max(0, Math.floor((x - f.x) / tw)));
      return (i * ROWS + r) * cols + c;
    }
    return -1;
  };

  /**
   * İmleç durunca render devralıyor: baştaki kutucuktan itibaren tarama
   * sırasında ilk çözülmemişi buluyor, sonuna gelince başa dönüyor.
   * Kutucuklar sırayla değil kullanıcı nereye dokunduysa oradan bitiyor —
   * gerçek renderer'da da bucket'lar sıradan çıkar.
   */
  const next = () => {
    for (let n = 1; n <= tiles.length; n += 1) {
      const i = (head + n) % tiles.length;
      if (!done[i]) return i;
    }
    return -1;
  };

  /**
   * Zaman tabanı `performance.now()`: gsap.ticker'ın verdiği `time` kendi
   * başlangıcından saniye sayıyor, `lastMove` ise imleç olayından geliyor.
   * İkisini karşılaştırmak farklı iki saati karşılaştırmak olurdu.
   */
  const tick = () => {
    const now = performance.now();
    if (now - lastMove < IDLE || now - clock < STEP) return;
    clock = now;

    const i = next();
    if (i < 0) return stop(); // kareler bitti, döngüye gerek yok
    moveBucket(i);
    solve(i);
  };

  const start = () => {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
  };

  frozen = still;
  build();

  // Yalnızca ölçü gerçekten değiştiyse yeniden kuruluyor: gözlemcinin
  // kurulumdaki ilk tetiklemesi ve gereksiz tekrarlar boşa iş yaptırmasın.
  const ro = new ResizeObserver(() => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w === lastW && h === lastH) return;
    build();
  });
  ro.observe(host);

  if (still) {
    /**
     * Hareket azaltma: kareler kurulumda çözülmüş geliyor, bucket hiç
     * dolaşmıyor. Durumu burada kuruyoruz çünkü çağıran taraf bu kipte
     * `enter`/`leave` çağırmıyor — perdenin açılması tek olay.
     */
    load();
    paintAll();
    return {
      enter() {},
      move() {},
      leave() {},
      destroy() {
        ro.disconnect();
        host.replaceChildren();
      },
    };
  }

  return {
    enter(e) {
      load();
      bucket.style.opacity = "0.9";
      lastMove = performance.now();
      clock = lastMove;
      const i = indexAt(e);
      if (i >= 0) {
        moveBucket(i);
        solve(i);
      }
      start();
    },

    move(e) {
      lastMove = performance.now();
      const i = indexAt(e);
      if (i < 0 || i === head) return;
      moveBucket(i);
      solve(i);
    },

    leave() {
      stop();
      bucket.style.opacity = "0";
      // Kareler siliniyor: sönüm CSS'te, durum hemen sıfırlanıyor. Geçiş
      // bitmeden geri girilirse kutucuk yeniden çözülüyor ve aynı geçiş onu
      // pürüzsüzce geri getiriyor.
      tiles.forEach((t) => (t.el.style.opacity = "0"));
      done.fill(false);
      head = -1;
    },

    destroy() {
      stop();
      ro.disconnect();
      host.replaceChildren();
    },
  };
}
