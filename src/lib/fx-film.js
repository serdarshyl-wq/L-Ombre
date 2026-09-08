import gsap from "gsap";
import { seed } from "@/lib/seed";

/**
 * CINEMATOGRAPHY satırının imza hover'ı: bant bir kamera kapısıdır.
 *
 * Yazının bittiği yerde 35 mm negatif başlıyor — iki sıra perforasyon, ortada
 * kadraj alanı. İmleç kapıyı (gate) taşıyor: hangi yuvadaysan film orada
 * pozlanıyor. Film sürekli akmıyor, gerçek bir kameradaki gibi **kare kare
 * çekiliyor**: tırnak filmi bir pull-down boyu aşağı çekiyor, kare kapıda
 * kilitleniyor, poz veriliyor, sonraki kare geliyor. Sinemanın tek mekanik
 * gerçeği bu — görüntü akmaz, 24 kez durur.
 *
 * Kapıdan geçen kare pozlanmış olarak çıkıyor: solda biriken tonlu kareler
 * çekilmiş metraj. Sağ taraf hâlâ bakir. Yani satırda gördüğün şey "bir
 * animasyon" değil, çalışan bir kamera ve dolan bir makara.
 *
 * İmlecin hızı kadans: dururken sakin bir tempo (kamera çalışıyor, bekliyor),
 * süpürünce pull-down hızlanıyor — ramping. Sağ üstteki sayaç çekilen kareyi
 * gösteriyor, operatörün baktığı tek rakam.
 *
 * Neden gerçek ölçüler: aşağıdaki mm değerleri uydurma değil, 4-perf 35 mm
 * negatifin kendi ölçüleri. Kadrajın enine göre boyu, perforasyon aralığı ve
 * Academy açıklığının çerçeveye oturuşu bu yüzden doğru duruyor — filmi bilen
 * biri baktığında yanlış bir şey görmüyor.
 *
 * Maliyet: kare başına iki transform (film + perforasyon şeridi), kapı ancak
 * yuva değişince yazılıyor, kare içerikleri yalnızca pull-down anında. Tek
 * döngü gsap.ticker üzerinde ve hover bitip film oturunca kendini kapatıyor.
 */

// 4-perf 35 mm negatif, mm cinsinden. Şeritteki her ölçü bunlardan türüyor.
const STOCK = 35; // şeridin tam eni
const SPAN = 24; // perforasyon sıraları arası — kadraj alanı
const PULLDOWN = 19.05; // bir karenin şerit boyunca uzunluğu (4 perf)
const PERF_PITCH = 4.75;
const PERF_W = 2.8;
const PERF_H = 1.98;
const AP_W = 16; // Academy açıklığı, şerit boyunca
const AP_H = 21.95; // Academy açıklığı, şerit eninde

const IDLE_MS = 300; // imleç dururken kare aralığı
const FAST_MS = 62; // tam hızda kare aralığı
const SPEED_REF = 1.4; // px/ms — bu hızda kadans tepeye çıkıyor
const DECAY = 0.9; // hız sönümü
const PULL_MS = 140; // tırnağın filmi çekme süresi — gerisi poz süresi
const GATE_EASE = 0.18; // kapının imleci takip ağırlığı

/**
 * Çekişin eğrisi. Önce `1-(1-t)^4` idi: ölçtük, film duruştan tam hıza tek
 * karede fırlıyordu — 20.4 px. "Tık" hissinin kaynağı buydu. Bu eğri sıfır
 * hızla başlayıp sıfır hızla bitiyor; aynı zamanlamada ilk adım 0.26 px'e
 * iniyor, ivme sıçraması yarılanıyor, ama karelerin yarısından fazlasında
 * film hâlâ duruyor. Adım korunuyor, sertliği gidiyor.
 */
const glide = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

const el = (className) => {
  const node = document.createElement("div");
  node.className = className;
  return node;
};

export function mountFilmFx(host, { still = false } = {}) {
  let cells = []; // { el, k }
  let strip = null;
  let film = null;
  let perfs = null;
  let gate = null;
  let counter = null;

  let W = 0;
  let H = 0;
  let pitch = 0; // px — bir kare
  let perfPitch = 0;
  let inset = 0; // kadrajın kare içindeki payı (kare çizgisi)
  let slots = 1;

  let advance = 0; // kesirli: pull-down sürerken ara değer
  let from = 0; // pull-down'ın başladığı yer
  let target = 0; // tam kare — tırnağın hedefi
  let shot = -1; // pozlanmış en yüksek kare indeksi
  let rolled = 0; // sayaç
  let slot = -1; // kapının oturduğu yuva
  let gx = 0; // kapının takip eden konumu
  let gxTarget = 0;
  let speed = 0;
  let lastX = 0;
  let lastT = 0;
  let stepAt = 0;

  let hover = false;
  let running = false;

  /** Pozlanmış kare: yatay bir ton geçişi. Şerit yatayken görüntü de 90°
   *  dönük duruyor — düz bir dolgu "kutu" gibi okunurdu, geçiş kareyi
   *  fotoğrafa benzetiyor. */
  const paint = (c) => {
    if (c.k > shot) {
      if (!c.on) return;
      c.on = false;
      c.el.style.opacity = "0";
      return;
    }
    if (c.on && c.drawn === c.k) return;
    c.on = true;
    c.drawn = c.k;
    // Üç durak ve eğik bir eksen. Tek yönlü iki duraklı geçiş kareyi bir
    // yer tutucu kutuya benzetiyordu; kırılan eksen ve ortadaki durak onu
    // tonu olan bir görüntüye çeviriyor. Şerit yatay, görüntü 90° dönük —
    // eksen de o yüzden dikeye değil yataya yakın.
    const ink = (v) => `color-mix(in oklab, currentColor ${v.toFixed(0)}%, transparent)`;
    const angle = 68 + seed(c.k + 31) * 44;
    c.el.style.backgroundImage =
      `linear-gradient(${angle.toFixed(0)}deg,` +
      ` ${ink(6 + seed(c.k) * 26)} 0%,` +
      ` ${ink(6 + seed(c.k + 97) * 26)} 46%,` +
      ` ${ink(6 + seed(c.k + 203) * 26)} 100%)`;
    c.el.style.opacity = "1";
  };

  // Kapı sağa atladığında tek bir kare değil, arada kalan bütün kareler
  // pozlanmış oluyor. Yazım koruması `paint` içinde, tarama bedava.
  const paintAll = () => {
    for (const c of cells) paint(c);
  };

  // Sola çıkan kare sağ uca dolanıyor. Adım başına tek hücre taşınıyor —
  // tüm şeridi yeniden indekslemek gerekmiyor.
  const recycle = (dx) => {
    const n = cells.length;
    for (const c of cells) {
      let k = c.k;
      while (dx + k * pitch < -2 * pitch) k += n;
      if (k === c.k) continue;
      c.k = k;
      c.el.style.transform = `translate3d(${(k * pitch + inset).toFixed(1)}px,0,0)`;
      paint(c);
    }
  };

  const build = () => {
    W = host.clientWidth;
    H = host.clientHeight;
    if (!W || !H) return;

    // Şerit bandı doldurmuyor: üstte ve altta nefes kalıyor, sayaç da oraya
    // yerleşiyor. Dar ekranda pay sabit tabana oturuyor.
    const gutter = Math.max(14, Math.round(H * 0.15));
    const stripH = H - gutter * 2;
    const px = stripH / STOCK; // 1 mm kaç piksel
    const perfRow = ((STOCK - SPAN) / 2) * px;

    pitch = PULLDOWN * px;
    perfPitch = PERF_PITCH * px;
    inset = ((PULLDOWN - AP_W) / 2) * px;
    slots = Math.max(1, Math.floor(W / pitch));

    strip = el("absolute inset-x-0");
    strip.style.top = `${gutter}px`;
    strip.style.height = `${stripH}px`;

    // Perforasyonlar tek elemanda iki katman: üst ve alt sıra. Yüzlerce delik
    // için DOM açmanın anlamı yok, gradyan zaten periyodik.
    const hole = `linear-gradient(to right, currentColor 0 ${(PERF_W * px).toFixed(1)}px, transparent ${(PERF_W * px).toFixed(1)}px)`;
    perfs = el("absolute inset-y-0 opacity-30 will-change-transform");
    perfs.style.left = `${(-perfPitch).toFixed(1)}px`;
    perfs.style.width = `${(W + perfPitch * 2).toFixed(1)}px`;
    perfs.style.backgroundImage = `${hole}, ${hole}`;
    perfs.style.backgroundRepeat = "repeat-x";
    perfs.style.backgroundSize = `${perfPitch.toFixed(1)}px ${(PERF_H * px).toFixed(1)}px, ${perfPitch.toFixed(1)}px ${(PERF_H * px).toFixed(1)}px`;
    perfs.style.backgroundPosition = `0 ${((perfRow - PERF_H * px) / 2).toFixed(1)}px, 0 ${(stripH - (perfRow + PERF_H * px) / 2).toFixed(1)}px`;

    film = el("absolute top-0 left-0 will-change-transform");

    const top = perfRow + ((SPAN - AP_H) / 2) * px;
    const count = Math.ceil(W / pitch) + 3;
    const frag = document.createDocumentFragment();

    cells = [];
    for (let j = 0; j < count; j += 1) {
      const node = el("absolute rounded-[1px]");
      node.style.top = `${top.toFixed(1)}px`;
      node.style.width = `${(AP_W * px).toFixed(1)}px`;
      node.style.height = `${(AP_H * px).toFixed(1)}px`;
      node.style.opacity = "0";
      node.style.transform = `translate3d(${((j - 2) * pitch + inset).toFixed(1)}px,0,0)`;
      frag.appendChild(node);
      cells.push({ el: node, k: j - 2, on: false, drawn: -1 });
    }
    film.appendChild(frag);

    // Kapı: Academy açıklığının kendisi, köşeleri yuvarlak — gerçek açıklık
    // plakası da öyle. Karenin tam üstüne oturuyor, bir kılavuz değil.
    gate = el(
      "absolute rounded-[2px] border border-current opacity-70 will-change-transform"
    );
    gate.style.top = `${top.toFixed(1)}px`;
    gate.style.width = `${(AP_W * px).toFixed(1)}px`;
    gate.style.height = `${(AP_H * px).toFixed(1)}px`;

    counter = el(
      "absolute top-0 right-0 flex items-center tabular-nums tracking-[0.22em] opacity-30"
    );
    counter.style.height = `${gutter}px`;
    counter.style.fontSize = `${Math.min(11, gutter - 5)}px`;

    strip.append(perfs, film, gate);
    host.replaceChildren(strip, counter);

    advance = 0;
    target = 0;
    shot = -1;
    slot = -1;
    gx = gxTarget = still ? W * 0.62 : gxTarget;
  };

  // Kapıdaki kare pozlanıyor, sonra tırnak filmi bir boy çekiyor.
  const shoot = (now) => {
    stepAt = now;
    from = advance;
    const k = Math.round(slot + target);
    if (k > shot) {
      rolled += k - shot;
      shot = k;
      counter.textContent = String(rolled % 10000).padStart(4, "0");
      paintAll();
    }
    target += 1;
  };

  const place = () => {
    const dx = -advance * pitch;
    recycle(dx);
    film.style.transform = `translate3d(${dx.toFixed(2)}px,0,0)`;
    // Delikler periyodik: şeridi bir perf aralığında dolandırmak yetiyor,
    // böylece kayma sınırsız büyümüyor.
    perfs.style.transform = `translate3d(${(dx % perfPitch).toFixed(2)}px,0,0)`;
  };

  const aim = () => {
    const s = Math.min(
      slots - 1,
      Math.max(0, Math.round((gx - pitch / 2) / pitch))
    );
    if (s === slot) return;
    slot = s;
    gate.style.transform = `translate3d(${(s * pitch + inset).toFixed(1)}px,0,0)`;
  };

  const tick = () => {
    const now = performance.now();
    speed *= DECAY;

    gx += (gxTarget - gx) * GATE_EASE;
    aim();

    if (hover) {
      const ramp = Math.min(1, speed / SPEED_REF);
      if (now - stepAt >= IDLE_MS + (FAST_MS - IDLE_MS) * ramp) shoot(now);
    }

    /**
     * Tırnak hareketi: çekiş PULL_MS'de bitiyor, aradaki bütün süre poz.
     * Üstel yaklaşımla yazıldığında film asla oturmuyordu — ölçtük, kare
     * kapıya 6px sapmayla giriyordu; yani mekanizma sürekli kayan bir şerit
     * gibi okunuyordu. Süreye bağlayınca kare kapıda gerçekten duruyor,
     * duruş da hareketin kendisi kadar önemli.
     *
     * Kadans hızlanıp aralık PULL_MS'in altına inince çekiş kesintisiz hale
     * geliyor — overcrank'te film de öyle akar.
     */
    const t = Math.min(1, (now - stepAt) / PULL_MS);
    advance = from + (target - from) * glide(t);
    place();

    // Hover bitti, film kapıya oturdu, kapı da yerini buldu: döngüyü bırak.
    if (!hover && advance === target && Math.abs(gxTarget - gx) < 0.5) stop();
  };

  const start = () => {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  };

  function stop() {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
  }

  // İmleç yazının üstündeyken kapı bandın başında bekliyor — spektrumdaki
  // ile aynı davranış, kelime bittiği yerden alet devralıyor.
  const at = (e) => {
    const box = host.getBoundingClientRect();
    return Math.min(box.width, Math.max(0, e.clientX - box.left));
  };

  build();

  if (still) {
    // Hareket azaltma: makara duruyor. Kapı bandın sağına doğru, solunda
    // çekilmiş metraj — tek karede anlatılan aynı hikâye, hareketsiz.
    aim();
    shot = slot;
    rolled = slot + 1;
    counter.textContent = String(rolled).padStart(4, "0");
    place();
    paintAll();
    return {
      enter() {},
      move() {},
      leave() {},
      destroy: () => host.replaceChildren(),
    };
  }

  counter.textContent = "0000";

  const ro = new ResizeObserver(() => {
    if (host.clientWidth === W && host.clientHeight === H) return;
    build();
    place();
  });
  ro.observe(host);

  return {
    enter(e) {
      hover = true;
      from = advance;
      gx = gxTarget = at(e);
      lastX = gx;
      lastT = stepAt = performance.now();
      speed = 0;
      start();
    },
    move(e) {
      const now = performance.now();
      gxTarget = at(e);
      // Anlık hız kadansı sürüyor: süpürdükçe pull-down sıklaşıyor.
      speed = speed * 0.5 + (Math.abs(gxTarget - lastX) / Math.max(8, now - lastT)) * 0.5;
      lastX = gxTarget;
      lastT = now;
    },
    leave() {
      hover = false;
    },
    destroy() {
      stop();
      ro.disconnect();
      host.replaceChildren();
    },
  };
}
