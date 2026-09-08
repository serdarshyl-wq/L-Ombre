import gsap from "gsap";
import { seed } from "@/lib/seed";

/**
 * SOUND DESIGN satırının imza hover'ı.
 *
 * Yazının bittiği yerden satırın sonuna kadar uzanan bir spektrum. Sessizken
 * ortada ince, kesintili bir taban çizgisi — sitenin her yerindeki "orta
 * çizgi" jestinin aynısı. İmleç girdiği anda çevresindeki çubuklar o çizgiden
 * yukarı ve aşağı eşit açılıyor; imleç kaydıkça canlı bölge onu takip ediyor.
 * Ses masasında bir kanalı dinlerken görülen şey.
 *
 * Alan tipografiye hiç girmiyor: kelime biter, ses başlar. İmleç harflerin
 * üstündeyken tepe alanın başında bekliyor (aşağıda kırpılıyor) — yani
 * dalga kelimenin ucundan yayılıyor gibi duruyor.
 *
 * Çubuklar perdenin içinde yaşıyor: kemik zemin nereye kadar indiyse spektrum
 * da oraya kadar görünüyor. Yani ikinci hover birinciden ayrı bir katman değil,
 * onun açtığı yerde beliriyor.
 *
 * Maliyet: kare başına sadece imlecin yarıçapına giren çubuklar yazılıyor,
 * gerisi taban değerinde sabit kaldığı için atlanıyor. Tek döngü gsap.ticker
 * üzerinde — ayrı bir rAF açılmıyor — ve hover bitip genlik sönünce döngü
 * kendini kapatıyor.
 */

const SPACING = 16; // px — çubuk aralığı
const RADIUS = 210; // px — imlecin çevresinde spektrumun canlandığı yarıçap
const FLOOR = 0.05; // satır yüksekliğinin oranı: sessizlik
const PEAK = 0.66; // en yüksek tepe
const SPEED = 9; // rad/sn — temel salınım

const CURSOR_EASE = 0.14; // imleci takip ederken ağırlık hissi
const AMP_EASE = 0.08; // giriş/çıkışta genliğin açılıp kapanması
const EPSILON = 0.004; // bu kadarlık değişim için DOM'a yazmaya değmez

export function mountSoundFx(host, { still = false } = {}) {
  let bars = [];
  let painted = [];
  let width = 0;

  let cursor = 0; // takip eden konum
  let target = 0; // imlecin gerçek konumu
  let amp = 0; // yaşayan genlik
  let wanted = 0; // hedef genlik (hover 1, değilse 0)
  let running = false;

  const paint = (i, height) => {
    if (Math.abs(height - painted[i]) < EPSILON) return;
    painted[i] = height;
    bars[i].style.transform = `translate(-50%, -50%) scaleY(${height})`;
  };

  const build = () => {
    width = host.clientWidth;
    if (!width) return;

    const count = Math.max(2, Math.round(width / SPACING));
    const frag = document.createDocumentFragment();

    bars = [];
    painted = [];

    for (let i = 0; i < count; i += 1) {
      const bar = document.createElement("span");
      // `bg-current`: perdenin içindeki obsidyen. `will-change` yok —
      // onlarca çubuğu ayrı katmana çıkarmanın maliyeti kazancından büyük.
      bar.className = "absolute top-1/2 h-full w-[2px] bg-current opacity-40";
      // Yüzde: satır genişliği değişse de çubuklar orantısını koruyor.
      bar.style.left = `${((i + 0.5) / count) * 100}%`;
      bar.style.transform = `translate(-50%, -50%) scaleY(${FLOOR})`;
      frag.appendChild(bar);
      bars.push(bar);
      painted.push(FLOOR);
    }

    host.replaceChildren(frag);
  };

  const tick = (time) => {
    cursor += (target - cursor) * CURSOR_EASE;
    amp += (wanted - amp) * AMP_EASE;

    const n = bars.length;
    const reach = amp * (PEAK - FLOOR);

    for (let i = 0; i < n; i += 1) {
      const x = ((i + 0.5) / n) * width;
      const d = Math.abs(x - cursor) / RADIUS;

      if (d >= 1) {
        paint(i, FLOOR);
        continue;
      }

      // Kosinüs karesi: kenarlarda türevi de sıfırlanıyor, yani canlı bölge
      // dışarı doğru sert bitmiyor, eriyor.
      const env = Math.cos(d * Math.PI * 0.5) ** 2;
      const s = seed(i);

      // İki harmonik: tek sinüs mekanik bir dalga yapıyor, ikincisi onu
      // kırıp analizör düzensizliği veriyor.
      const wave =
        0.5 +
        0.35 * Math.sin(time * SPEED * (0.6 + s * 0.9) + s * 40 + i * 0.35) +
        0.15 * Math.sin(time * SPEED * 1.9 + i * 0.9);

      paint(i, FLOOR + reach * env * Math.min(1, Math.max(0, wave)));
    }

    // Hover bitti ve genlik söndü: döngüyü bırak, boşta dönmesin.
    if (!wanted && amp < 0.002) stop();
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

  // İmleç alanın soluna — yani yazının üstüne — düştüğünde kırpılıyor:
  // spektrum kelimenin ucunda toplanıp orada nefes almaya devam ediyor.
  const at = (e) => {
    const box = host.getBoundingClientRect();
    return Math.min(box.width, Math.max(0, e.clientX - box.left));
  };

  build();

  if (still) {
    // Hareket azaltma: taban çizgisi duruyor, salınım yok.
    return { enter() {}, move() {}, leave() {}, destroy: () => host.replaceChildren() };
  }

  // Satır genişliği değişince çubuk sayısı da değişiyor.
  const ro = new ResizeObserver(() => {
    const next = host.clientWidth;
    if (next && next !== width) build();
  });
  ro.observe(host);

  return {
    enter(e) {
      // İmlecin altından açılıyor: soldan süpürerek gelmiyor.
      cursor = target = at(e);
      wanted = 1;
      start();
    },
    move(e) {
      target = at(e);
    },
    leave() {
      wanted = 0;
    },
    destroy() {
      stop();
      ro.disconnect();
      host.replaceChildren();
    },
  };
}
