import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import JournalFilter from "@/components/JournalFilter";
import Reveal from "@/components/Reveal";
import Roll from "@/components/Roll";
import { getCards } from "@/sanity/lib/journal";



export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "Case studies and writing from L’Ombre — how the films were built, and what the studio is looking at.";

export const metadata = {
  title: "Journal",
  description: DESCRIPTION,
  alternates: { canonical: "/journal" },
  openGraph: {
    type: "website",
    url: "/journal",
    title: "Journal — L’Ombre",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Journal — L’Ombre",
    description: DESCRIPTION,
  },
};

const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";

const MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

const when = (iso) => (iso ? MONTH.format(new Date(iso)) : "");


function Card({ card, lead }) {
  const { kind, slug, title, blurb, label, date, cover, fallback, meta } = card;
  const src = cover?.url ?? fallback;

  return (
    <li
      className="group/card col-span-12 min-[900px]:col-span-6 min-[900px]:data-lead:col-span-12"
      data-kind={kind}
      data-lead={lead ? "true" : undefined}
    >
      <Link
        className="group grid gap-[clamp(1.25rem,3vh,2rem)] min-[900px]:group-data-lead/card:grid-cols-[7fr_5fr] min-[900px]:group-data-lead/card:items-end min-[900px]:group-data-lead/card:gap-[clamp(2rem,5vw,5rem)]"
        href={`/journal/${slug}`}
      >

        <div className="overflow-clip" data-curtain>
          <div data-sheet>
            <div
              className="relative aspect-4/3 overflow-clip min-[900px]:group-data-lead/card:aspect-video"
              data-still
            >
              {src ? (
                <Image
                  alt={cover?.alt ?? title}
                  blurDataURL={cover?.lqip}
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
                  fill
                  placeholder={cover?.lqip ? "blur" : "empty"}
                  sizes="(max-width: 900px) 100vw, (min-width: 901px) 50vw"
                  src={src}
                />
              ) : (
                <div className="absolute inset-0 bg-hairline/30" />
              )}
            </div>
          </div>
        </div>

        <div data-rise>
          <div
            className={`${MICRO} flex items-baseline justify-between gap-4 border-b border-hairline pb-[clamp(0.6rem,1.6vh,0.9rem)] text-bone/40`}
          >
            <span>{label}</span>
            <span>{when(date)}</span>
          </div>

          <h2 className="mt-[clamp(1rem,2.5vh,1.75rem)] font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.06] font-[350] tracking-[-0.02em] min-[900px]:group-data-lead/card:text-[clamp(2.25rem,4.5vw,4rem)] min-[900px]:group-data-lead/card:leading-[0.98]">
            {title}
          </h2>

          {meta ? (
            <p className={`${MICRO} mt-[clamp(0.6rem,1.4vh,0.9rem)] text-bone/35`}>
              {meta}
            </p>
          ) : null}

          <p className="mt-[clamp(0.85rem,2vh,1.25rem)] line-clamp-3 max-w-[52ch] text-[clamp(0.875rem,1.05vw,1rem)] leading-[1.7] text-bone/60">
            {blurb}
          </p>


          <span
            className={`${MICRO} mt-[clamp(1.1rem,2.6vh,1.75rem)] inline-flex items-center gap-[0.7em] text-bone/70 transition-colors duration-300 ease-[ease] group-hover:text-bone motion-reduce:transition-none`}
          >
            <Roll label="Read" />
            <ArrowUpRight
              className="h-[1.1em] w-[1.1em] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-[0.2em] group-hover:translate-y-[-0.2em] motion-reduce:transition-none"
              strokeWidth={1.5}
            />
          </span>
        </div>
      </Link>
    </li>
  );
}

export default async function JournalPage() {
  const cards = await getCards();

  const counts = {
    all: cards.length,
    "case-study": cards.filter((card) => card.kind === "case-study").length,
    culture: cards.filter((card) => card.kind === "culture").length,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Journal — L’Ombre",
    description: DESCRIPTION,
    url: `${SITE_URL}/journal`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cards.length,
      itemListElement: cards.map((card, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/journal/${card.slug}`,
        name: card.title,
      })),
    },
  };

  return (
    <main className="pt-(--nav-h)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <section className="px-gutter pt-[clamp(2.5rem,8vh,5rem)] pb-[clamp(2.5rem,8vh,5rem)]">
          <div
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3"
            data-now
            data-shutter
          >
            <h1 className="font-display text-[clamp(3rem,12vw,15rem)] leading-[0.86] font-[350] tracking-[-0.04em] uppercase">
              <span className="block" data-line>
                Journal
              </span>
            </h1>
            <p className={`${MICRO} whitespace-nowrap text-bone/45`}>
              <span className="block" data-line>
                {cards.length} {cards.length === 1 ? "Entrée" : "Entrées"}
              </span>
            </p>
          </div>

          <div
            className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[52ch] overflow-clip"
            data-mask
            data-now
          >
            <p
              className="text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.75] text-bone/60"
              data-line
            >
              How the films were built, and what the studio is looking at while
              it builds them.
            </p>
          </div>
        </section>

        <JournalFilter counts={counts}>
          {cards.length ? (

            <ol
              className="relative grid grid-cols-12 gap-x-[clamp(1.5rem,4vw,4.5rem)] gap-y-[clamp(3rem,9vh,6.5rem)] px-gutter py-[clamp(3rem,9vh,6.5rem)]"
              data-grid
            >
              {cards.map((card, i) => (
                <Card card={card} key={card.id} lead={i === 0} />
              ))}
            </ol>
          ) : (
            <p className="px-gutter py-[clamp(4rem,14vh,9rem)] text-center text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.75] text-bone/45">
              The first entry is being written.
            </p>
          )}
        </JournalFilter>
      </Reveal>
    </main>
  );
}
