/**
 * Sunucudan gelen metni mount sonrası karakterlere böler.
 *
 * SEO kuralı: bölme DAİMA client'ta, hydration sonrası olur. Sunucu HTML'i
 * cümlenin tamamını düz metin olarak içerir — crawler bölünmemiş halini görür.
 * Tam metin aria-label'da kalır, parçalar aria-hidden; ekran okuyucu harf harf
 * okumaz.
 */
export function splitChars(el) {
  if (!el) return [];

  if (el.dataset.split === "done") {
    return Array.from(el.querySelectorAll("[data-char]"));
  }

  const text = el.textContent.replace(/\s+/g, " ").trim();
  const words = text.split(" ");
  const frag = document.createDocumentFragment();
  const chars = [];

  words.forEach((word, i) => {
    const wordEl = document.createElement("span");
    wordEl.className = "split-word";
    wordEl.setAttribute("aria-hidden", "true");

    // Spread ile code point bazlı gezinme — É, ’ gibi karakterler bozulmaz.
    for (const ch of word) {
      const charEl = document.createElement("span");
      charEl.className = "split-char";
      charEl.dataset.char = "";
      charEl.textContent = ch;
      wordEl.appendChild(charEl);
      chars.push(charEl);
    }

    frag.appendChild(wordEl);
    if (i < words.length - 1) frag.appendChild(document.createTextNode(" "));
  });

  el.setAttribute("aria-label", text);
  el.replaceChildren(frag);
  el.dataset.split = "done";

  return chars;
}
