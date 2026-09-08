/**
 * Intro sekansının zamanlaması.
 *
 * Burada duruyor çünkü iki taraf da bilmek zorunda: sahnenin kendisi
 * (IntroStage) ve gezinme (SmoothScroll). Sekans scroll ile sürülüyor, yani
 * "hero'dan başla" demek "şu scroll noktasına in" demek — o noktayı beat'lerden
 * türetmek, iki dosyaya ayrı ayrı sayı yazmaktan güvenli.
 */

export const BEATS = {
  curtain: { to: 100, at: 0, duration: 1, ease: "power1.in" },
  slogans: [
    { out: [0.05, 0.2] },
    { in: [0.2, 0.35], out: [0.38, 0.53] },
    { in: [0.53, 0.68], out: [0.71, 0.86] },
  ],
  mark: [0.86, 1],

  hold: 0.18,
};

// Zaman çizelgesinin toplam boyu: son beat + sondaki bekleme.
export const TOTAL = BEATS.mark[1] + BEATS.hold;

// Navbar logo belirmeye başlarken iniyor.
export const NAV_PROGRESS = BEATS.mark[0] / TOTAL;

/**
 * Hero: L'OMBRE tam yazılmış, navbar inmiş, zemin henüz dolmamış.
 *
 * Bilerek beklemenin başı, sonu değil: sekansın en sonunda navbar dolu zemine
 * geçiyor (`solid`), yani orası artık hero değil "hero'yu geçmiş" hâli.
 */
export const HERO_PROGRESS = BEATS.mark[1] / TOTAL;

/**
 * Hero'nun scroll karşılığı. Sekansın bütçesi sahnenin boyu eksi bir ekran —
 * ScrollTrigger'ın `top top` → `bottom bottom` aralığının aynısı.
 *
 * Hareket azaltmada sekans hiç sürülmüyor ve sahne tek ekrana iniyor; orada
 * hero zaten sayfanın tepesi.
 */
export function heroScrollY() {
  if (typeof window === "undefined") return 0;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;

  const stage = document.querySelector(".stage");
  if (!stage) return 0;

  const range = stage.offsetHeight - window.innerHeight;
  return range > 0 ? Math.round(range * HERO_PROGRESS) : 0;
}
