import gsap from "gsap";

/**
 * CREATIVE DIRECTION satırının imza hover'ı: bant bir tuvaldir.
 *
 * Diğer üç satırın aleti belli — analizör, render penceresi, kamera kapısı.
 * Kreatif direksiyonun aleti bir cihaz değil, **karar**: aynı malzemeyi
 * nereye koyacağına karar vermek. Onu gösteriyoruz.
 *
 * Tuvalde sabit bir sütun ızgarası ve dört eleman var: bir görsel alanı, bir
 * başlık, bir metin bloğu, bir işaret. Yani bir sayfa düzeninin parçaları.
 * İmleç bir hizalama kılavuzu taşıyor; kılavuz tuvali süpürdükçe aynı dört
 * eleman **yeniden diziliyor** — sol yerleşim, üst yerleşim, dar sağ kolon,
 * merkez. Izgara hiç değişmiyor, düzen değişiyor. Art direksiyon tam olarak
 * budur: malzeme sabittir, kompozisyon seçilir.
 *
 * Neden bu satırda bu iş: "CREATIVE DIRECTION" dördün en uzun etiketi, yani
 * geriye en dar bant burada kalıyor — ölçtük, 1512'de 273x135. Spektrum ya da
 * film şeridi gibi uzunluğa yaslanan bir jest bu alanda çalışmazdı. Kalan
 * boşluk neredeyse bir tuval oranında; işi ona göre kurduk.
 *
 * Maliyet: düzen değişimi tek seferlik bir durum değişimi, dört transform
 * yazılıyor ve gerisini CSS geçişi taşıyor — kare başına JS yok. Döngü
 * yalnızca kılavuz imlece yetişirken dönüyor; imleç durunca hover sürse bile
 * kendini kapatıyor.
 */

const COLS = 6; // tuvalin sütun ızgarası
const ROWS = 4; // görünmez taban ızgarası
const SWAP = 0.55; // sn — kompozisyonun yeni yerine oturması
const STAGGER = 0.045; // sn — elemanlar sırayla otursun, hep birlikte değil
const GUIDE_EASE = 0.16; // kılavuzun imleci takip ağırlığı
const HYST = 0.12; // dilim sınırında titremeyi kesen pay

/**
 * Dört kompozisyon. Sayılar sütun ve satır birimi — piksel değil, çünkü
 * düzenin kendisi ekran boyutundan bağımsız bir karar.
 *
 * image: [sütun, satır, en, boy] — diğerleri sabit yükseklikte: [sütun,
 * satır, en]. Yüksekliği sabit tutmak sadece bir tercih değil: blok ölçekle
 * geriliyor, dikey ölçek metin çizgilerini de kalınlaştırırdı.
 */
const LAYOUTS = [
  // sol kütle
  {
    image: [0, 0, 3, 4],
    rule: [3.55, 0.5, 2.0],
    text: [3.55, 1.45, 2.45],
    mark: [3.55, 3.45],
  },
  // üst kütle
  {
    image: [0, 0, 6, 2.3],
    rule: [0, 2.7, 2.2],
    text: [0, 3.4, 3.4],
    mark: [5.7, 3.45],
  },
  // dar sağ kolon
  {
    image: [3.6, 0, 2.4, 4],
    rule: [0, 0.5, 2.4],
    text: [0, 1.45, 3.0],
    mark: [0, 3.45],
  },
  // merkez
  {
    // Başlık ve işaret cetvel tiklerinin altından başlıyor: 0.25 satırdayken
    // tiklerin üstüne biniyorlardı.
    image: [1.4, 0.9, 3.2, 2.1],
    rule: [0, 0.5, 1.6],
    text: [1.4, 3.4, 2.4],
    mark: [5.5, 0.55],
  },
];

const SVG_NS = "http://www.w3.org/2000/svg";

const el = (className) => {
  const node = document.createElement("div");
  node.className = className;
  return node;
};

export function mountLayoutFx(host, { still = false } = {}) {
  let guides = null;
  let guide = null;
  let parts = null; // { image, rule, text, mark }

  let W = 0;
  let H = 0;
  let cw = 0; // sütun genişliği
  let rh = 0; // satır yüksekliği
  let pad = 0;

  let current = -1;
  let gx = 0; // kılavuzun takip eden konumu
  let gxTarget = 0;
  let hover = false;
  let running = false;

  // translate + scale: taban kutusu 100 birim, ölçek onu geriyor. Genişliği
  // `width` ile animasyonlamak layout tetiklerdi.
  const place = (node, x, y, sx, sy) => {
    node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  };

  const apply = (i) => {
    const L = LAYOUTS[i];
    place(
      parts.image,
      L.image[0] * cw,
      pad + L.image[1] * rh,
      (L.image[2] * cw) / 100,
      (L.image[3] * rh) / 100
    );
    place(parts.rule, L.rule[0] * cw, pad + L.rule[1] * rh, (L.rule[2] * cw) / 100, 1);
    place(parts.text, L.text[0] * cw, pad + L.text[1] * rh, (L.text[2] * cw) / 100, 1);
    place(parts.mark, L.mark[0] * cw, pad + L.mark[1] * rh, 1, 1);
  };

  const build = () => {
    W = host.clientWidth;
    H = host.clientHeight;
    if (!W || !H) return;

    pad = Math.max(11, Math.round(H * 0.13));
    const canvas = H - pad * 2;
    cw = W / COLS;
    rh = canvas / ROWS;

    const ruleH = Math.max(2, Math.round(rh * 0.13));
    const lineGap = Math.max(5, Math.round(rh * 0.26));
    const textH = lineGap * 2 + 2;
    const markS = Math.max(4, Math.round(rh * 0.24));

    /**
     * Sütun ızgarası — ama tam boy çizgi olarak değil, tuvalin üst kenarındaki
     * kısa tikler olarak. Bir cetvel.
     *
     * Önce tam boy çizgilerdi: ölçtük ve baktık, çizgiler görsel alanının
     * içinden geçip kompozisyonu kesiyordu; ızgara arka plan olmaktan çıkıp
     * en baskın katman oluyordu. Tik hâlinde ızgara duruyor, karışmıyor.
     */
    const tickH = Math.max(4, Math.round(pad * 0.42));
    guides = el("absolute inset-x-0 opacity-30");
    guides.style.top = `${pad}px`;
    guides.style.height = `${canvas}px`;
    guides.style.backgroundImage =
      "linear-gradient(to right, currentColor 0 1px, transparent 1px)";
    guides.style.backgroundRepeat = "repeat-x";
    guides.style.backgroundSize = `${cw.toFixed(2)}px ${tickH}px`;

    // Görsel alanı: dolu bir kutu değil, çerçeveli bir yerleşim. Çerçeve SVG
    // çünkü blok ölçekleniyor — `non-scaling-stroke` çizgiyi sabit tutuyor,
    // CSS kenarlığı olsaydı x ve y'de farklı kalınlaşırdı.
    const image = document.createElementNS(SVG_NS, "svg");
    image.setAttribute("viewBox", "0 0 100 100");
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("class", "absolute top-0 left-0 origin-top-left");
    image.style.width = "100px";
    image.style.height = "100px";
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", "0.5");
    rect.setAttribute("y", "0.5");
    rect.setAttribute("width", "99");
    rect.setAttribute("height", "99");
    rect.setAttribute("vector-effect", "non-scaling-stroke");
    rect.setAttribute("fill", "currentColor");
    rect.setAttribute("fill-opacity", "0.13");
    rect.setAttribute("stroke", "currentColor");
    rect.setAttribute("stroke-opacity", "0.25");
    image.appendChild(rect);

    // Ton hiyerarşisi bir sayfa düzeninin kendi hiyerarşisi: kütle en açık,
    // başlık en koyu. Hepsi aynı grilikte olsaydı kompozisyon değil, doku
    // olurdu — ilk denemede tam olarak öyle oldu.
    const rule = el("absolute top-0 left-0 origin-top-left bg-current opacity-70");
    rule.style.width = "100px";
    rule.style.height = `${ruleH}px`;

    const text = el("absolute top-0 left-0 origin-top-left opacity-35");
    text.style.width = "100px";
    text.style.height = `${textH}px`;
    text.style.backgroundImage = `repeating-linear-gradient(to bottom, currentColor 0 2px, transparent 2px ${lineGap}px)`;

    const mark = el("absolute top-0 left-0 origin-top-left bg-current opacity-60");
    mark.style.width = `${markS}px`;
    mark.style.height = `${markS}px`;

    parts = { image, rule, text, mark };

    // Kompozisyon parça parça oturuyor: hepsi aynı anda yerine zıplasaydı
    // "yeniden çizildi" gibi okunurdu, sırayla oturunca "dizildi" gibi.
    ["image", "rule", "text", "mark"].forEach((k, i) => {
      parts[k].style.transition = `transform ${SWAP}s cubic-bezier(0.65,0,0.35,1) ${(i * STAGGER).toFixed(3)}s`;
    });

    guide = el(
      "absolute inset-y-0 w-px bg-current opacity-40 will-change-transform"
    );

    current = still ? 1 : Math.max(0, current);
    apply(current);
    if (still) gx = gxTarget = W * 0.5;
    guide.style.transform = `translateX(${gx.toFixed(1)}px)`;

    // İlk yerleşim DOM'a eklenmeden yazıldığı için geçiş tetiklenmiyor:
    // kompozisyon açılışta 0,0'dan uçmuyor, zaten yerinde başlıyor.
    host.replaceChildren(guides, image, rule, text, mark, guide);
  };

  const pick = (x) => {
    const raw = (x / W) * LAYOUTS.length;
    const i = Math.min(LAYOUTS.length - 1, Math.max(0, Math.floor(raw)));
    if (i === current || current < 0) return i;
    // Sınırın hemen dibinde karar değiştirmiyoruz: imleç çizgi üstünde
    // titrediğinde kompozisyon çırpınmasın.
    const inside = raw - i;
    return inside < HYST || inside > 1 - HYST ? current : i;
  };

  const tick = () => {
    gx += (gxTarget - gx) * GUIDE_EASE;
    guide.style.transform = `translateX(${gx.toFixed(1)}px)`;

    if (hover) {
      const next = pick(gx);
      if (next !== current) {
        current = next;
        apply(current);
        // Kararın işareti: kılavuz bir an keskinleşip sönüyor. WAAPI, yani
        // her kare JS yazımı yok.
        guide.animate(
          [{ opacity: 0.95 }, { opacity: 0.4 }],
          { duration: 480, easing: "ease-out" }
        );
      }
    }

    // Kılavuz imlece yetişti: yazacak bir şey kalmadı, döngü dursun. Hover
    // sürerken bile duruyor — bu satırda boşta dönen animasyon yok.
    if (Math.abs(gxTarget - gx) < 0.3) {
      gx = gxTarget;
      guide.style.transform = `translateX(${gx.toFixed(1)}px)`;
      stop();
    }
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

  // İmleç yazının üstündeyken kılavuz tuvalin başında bekliyor — diğer
  // satırlarla aynı davranış.
  const at = (e) => {
    const box = host.getBoundingClientRect();
    return Math.min(box.width, Math.max(0, e.clientX - box.left));
  };

  build();

  if (still) {
    return {
      enter() {},
      move() {},
      leave() {},
      destroy: () => host.replaceChildren(),
    };
  }

  const ro = new ResizeObserver(() => {
    if (host.clientWidth === W && host.clientHeight === H) return;
    build();
  });
  ro.observe(host);

  return {
    enter(e) {
      hover = true;
      gxTarget = at(e);
      start();
    },
    move(e) {
      gxTarget = at(e);
      start();
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
