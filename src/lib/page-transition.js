import gsap from "gsap";

/**
 * Kart → proje sayfası geçişi.
 *
 * Numara şu: hem morph katmanı hem örtü doğrudan `document.body`'ye ekleniyor,
 * React ağacının dışına. Client-side gezinme sırasında React sayfayı söküp
 * yenisini kurarken bu iki eleman ekranda kalmaya devam ediyor. Yani kadraj,
 * sayfa değişirken kesintisiz açılıyor — geçiş "düz" olmuyor.
 *
 * Akış:
 *   1. Kart tıklanır   → kartın üstünde 9:16 morph katmanı (z 200)
 *                        + arka plan alttan yükselmeye başlar (z 150)
 *   2. Örtü tamamlanır → onCovered(): gezinme başlar
 *   3. Proje sayfası mount olur, KENDİ 16:9 kutusunu ölçer
 *   4. completeMorph() → katman o ölçülen kutuya açılır
 *   5. Devir teslim    → sayfa görünür olur, örtü kalkar, katman solar
 *
 * Sayfa soldurulmuyor; örtü altından geliyor. Soldurma yönteminde aradaki
 * karelerde gövde arka planı görünüp flash yaratıyordu.
 *
 * Hedef geometri formülle tahmin edilmiyor, sayfanın kendisinden okunuyor —
 * o yüzden devir teslimde bir piksel bile zıplama olmuyor.
 */

let overlay = null;
let cover = null;
let activeSlug = null;

export function beginMorph({ slug, rect, image, onCovered }) {
  cancelMorph();
  activeSlug = slug;

  // Arka plan: sayfanın altından yükselen obsidyen perde.
  cover = document.createElement("div");
  cover.className = "morph-cover";
  document.body.appendChild(cover);

  gsap.fromTo(
    cover,
    { yPercent: 100 },
    {
      yPercent: 0,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => onCovered?.(),
    }
  );

  // Kadraj: kartın tam üstünde, tam o ölçüde. Perdenin üstünde kaldığı için
  // arka plan yükselirken video görünmeye devam ediyor.
  overlay = document.createElement("div");
  overlay.className = "morph";
  overlay.style.backgroundImage = `url("${image}")`;
  document.body.appendChild(overlay);

  gsap.set(overlay, {
    width: rect.width,
    height: rect.height,
    x: rect.left,
    y: rect.top,
  });

  // Kartta o an oynayan klip yerine kırpılmamış kare geçiyor; sert bir
  // değişim olmasın diye kısa bir çözülme.
  gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 });
}

export function morphPending(slug) {
  return Boolean(overlay) && activeSlug === slug;
}

/**
 * Katmanı sayfanın gerçek kutusuna açar. `onArrive` katman hedefe vardığı
 * anda çağrılır: sayfa kendi kutusunu tam o anda gösteriyor, perde kalkıyor,
 * katman da üstünden sessizce çekiliyor.
 */
export function completeMorph(rect, onArrive) {
  if (!overlay) {
    onArrive?.();
    return;
  }

  const el = overlay;
  const veil = cover;
  overlay = null;
  cover = null;
  activeSlug = null;

  gsap.to(el, {
    width: rect.width,
    height: rect.height,
    x: rect.left,
    y: rect.top,
    duration: 0.95,
    ease: "power3.inOut",
    onComplete: () => {
      onArrive?.();
      veil?.remove();
      gsap.to(el, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: () => el.remove(),
      });
    },
  });
}

export function cancelMorph() {
  overlay?.remove();
  cover?.remove();
  overlay = null;
  cover = null;
  activeSlug = null;
}
