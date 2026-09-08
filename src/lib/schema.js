const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Stüdyo tek bir varlık. Her sayfa kendi Organization nesnesini yeniden
 * yazarsa arama motoru beş ayrı kurum görüyor; ortak bir `@id` ile hepsi
 * aynı düğüme bağlanıyor.
 *
 * Nesne yalnızca referans değil, adını da taşıyor: Article gibi zengin
 * sonuç türlerinde `author` / `publisher` düğümünün kendi başına da
 * okunabilir olması gerekiyor.
 */
export const ORG = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "L’Ombre",
};

export const SITE_ID = `${SITE_URL}/#website`;

/**
 * Şemadaki URL alanları mutlak olmak zorunda; `/videos/...` gibi göreli bir
 * yol doğrulanamıyor. Zaten mutlak olan adresler (Sanity CDN) değişmeden
 * geçiyor.
 */
export const abs = (path) =>
  path ? new URL(path, SITE_URL).toString() : undefined;
