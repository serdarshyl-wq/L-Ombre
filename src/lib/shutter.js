/**
 * Yatay panjur — sitenin ortak geçiş dili.
 *
 * Yazı, cap yüksekliğinin tam ortasındaki hayali çizgiden yukarı ve aşağı
 * eşit açılır. Intro'daki sloganlar ve galerideki kart metinleri aynı
 * mekanizmayı kullanıyor; bütünlük buradan geliyor.
 *
 * İşin püf noktası şu: `line-height: 1` bir satır kutusunda taban çizgisi
 * ortada değil — altta descender, üstte ascender payı var ve bunlar eşit
 * değil. Kutuyu ortalamak harfleri ortalamıyor. O yüzden fontun gerçek
 * metrikleri ölçülüp cap ortası bulunuyor; hem konum kaydırması hem panjurun
 * kapanma çizgisi oradan türetiliyor.
 */

// Panjur tam açıkken kapanma çizgisinden ne kadar uzaklaştığı (kutu
// yüksekliğinin %'si). İki kenar da bu kadar yol alır — simetri buradan
// geliyor. Aksanlar ve descender'lar rahat sığsın diye cömert.
const REACH = 75;

const cache = new Map();
let ctx = null;

/**
 * Cap yüksekliğinin ortasının kutu içindeki oranı (0.5 = tam ortada).
 * Ölçüm "H" üzerinden — belirli bir metnin mürekkebi değil, fontun cap
 * yüksekliği referans. Böylece É'nin aksanı olan satırla olmayan satır aynı
 * çizgiye oturuyor.
 */
function capCenterRatio(el) {
  const FALLBACK = 0.5;

  try {
    const cs = getComputedStyle(el);
    const size = 200; // ölçüm ölçeği — sonuç orana çevrildiği için önemsiz
    const font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;

    if (cache.has(font)) return cache.get(font);

    ctx ??= document.createElement("canvas").getContext("2d");
    if (!ctx) return FALLBACK;

    ctx.font = font;
    const m = ctx.measureText("H");
    const ascent = m.fontBoundingBoxAscent;
    const descent = m.fontBoundingBoxDescent;
    const cap = m.actualBoundingBoxAscent; // "H" mürekkebinin taban üstü

    if (![ascent, descent, cap].every(Number.isFinite)) return FALLBACK;

    // line-height: 1 → kutu yüksekliği = font-size. Taban çizgisinin kutu
    // içindeki yeri yarım-leading kadar kayıyor.
    const halfLeading = (size - (ascent + descent)) / 2;
    const ratio = (halfLeading + ascent - cap / 2) / size;

    const value = Number.isFinite(ratio) ? ratio : FALLBACK;
    cache.set(font, value);
    return value;
  } catch {
    return FALLBACK;
  }
}

/**
 * Bir eleman için panjur değerleri.
 *
 *   shiftEm — harflerin görsel ortasını kutu ortasına oturtan kayma (em)
 *   shut    — kapanma çizgisi, tam cap ortasında
 *   open    — iki kenar da o çizgiden eşit mesafede
 */
export function shutterFor(el) {
  const c = capCenterRatio(el);
  const top = c * 100;
  const bottom = 100 - top;

  return {
    shiftEm: 0.5 - c,
    shut: { clipPath: `inset(${top}% 0% ${bottom}% 0%)` },
    open: { clipPath: `inset(${top - REACH}% 0% ${bottom - REACH}% 0%)` },
  };
}
