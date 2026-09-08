/**
 * Navbar'ın durumunu tutan küçük store.
 *
 *   open  — navbar sayfanın üstünden indi mi? Ana sayfada intro sekansına
 *           bağlı: logo hero'da belirdiği anda açılıyor, scroll geri
 *           sarılırsa kapanıyor.
 *   solid — zemin kemik beyazı mı, şeffaf mı? Hero üzerindeyken şeffaf
 *           (koyu sahnenin üstünde yazı kemik), hero geçildikten sonra dolu.
 *
 * React ağacının dışında yaşıyor çünkü Navbar layout'ta, IntroStage sayfada;
 * ortak bir ata üzerinden context taşımak için ikisini de sarmak gerekirdi.
 *
 * Snapshot referansı yalnızca değer değişince yenileniyor — useSyncExternalStore
 * aynı referansı görmezse sonsuz render döngüsüne giriyor.
 */

const INITIAL = { open: false, solid: false };

let state = INITIAL;
const listeners = new Set();

export function setNavState(patch) {
  const next = { ...state, ...patch };
  if (next.open === state.open && next.solid === state.solid) return;
  state = next;
  listeners.forEach((fn) => fn());
}

export function getNavState() {
  return state;
}

// Sunucuda hep kapalı: ilk HTML'de navbar inmiş görünmesin.
export function getServerNavState() {
  return INITIAL;
}

export function onNavGate(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
