import Reveal from "@/components/Reveal";

/**
 * Yasal sayfaların ortak kabuğu. Üç sayfa da aynı iskeleti kullanıyor:
 * üstte başlık bloğu, altında numaralanmış bölümler.
 *
 * Numaralar CSS sayacından geliyor — bölüm eklenip çıkarıldığında elle
 * güncellenecek bir şey kalmasın.
 *
 * Sunucu bileşeni: metnin tamamı HTML'de.
 */
export function Section({ title, children }) {
  return (
    <section className="legal__section" data-rise>
      <h2 className="legal__section-title">{title}</h2>
      <div className="legal__prose">{children}</div>
    </section>
  );
}

export default function Legal({ title, updated, lede, children }) {
  return (
    <main className="pt-(--nav-h)">
      <Reveal>
        <article className="legal">
          <header className="legal__head">
            <p className="legal__kicker" data-now data-rise>
              Legal
            </p>

            <h1 className="legal__title" data-now data-shutter>
              <span className="block" data-line>
                {title}
              </span>
            </h1>

            <p className="legal__lede" data-now data-rise>
              {lede}
            </p>

            <p className="legal__updated" data-now data-rise>
              Last updated — {updated}
            </p>
          </header>

          <div className="legal__body">{children}</div>
        </article>
      </Reveal>
    </main>
  );
}
