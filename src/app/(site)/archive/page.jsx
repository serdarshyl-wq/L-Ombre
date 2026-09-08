import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ReelStage from "@/components/ReelStage";
import Reveal from "@/components/Reveal";
import Roll from "@/components/Roll";
import projects from "@/data/projects.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "The complete archive of L’Ombre — advertising films for fragrance, fashion, automotive, sport and technology, produced in Paris.";

export const metadata = {
  title: "Archive",
  description: DESCRIPTION,
  alternates: { canonical: "/archive" },
  openGraph: {
    type: "website",
    url: "/archive",
    title: "Archive — L’Ombre",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive — L’Ombre",
    description: DESCRIPTION,
  },
};

const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";

const numeral = (i) => String(i + 1).padStart(2, "0");

function Row({ project, index }) {
  const { slug, brand, campaign, category, year, highlight, loopSrc, wide } =
    project;

  const flip = index % 2 === 1;

  return (

    <li className="overflow-clip border-t border-hairline">
      <Link
        className={`group grid items-center gap-[clamp(1.5rem,4vw,4.5rem)] px-gutter py-[clamp(1.75rem,5vh,3.5rem)] max-[900px]:grid-cols-1 max-[900px]:gap-[clamp(1.5rem,4vh,2.25rem)] ${flip ? "grid-cols-[30fr_70fr]" : "grid-cols-[70fr_30fr]"
          }`}
        href={`/projets/${slug}`}
      >
        <div
          className={`overflow-clip ${flip ? "order-2 max-[900px]:order-1" : ""}`}
          data-curtain
        >
          <div data-sheet>

            <video
              className="aspect-video w-full object-cover"
              data-reel
              data-still
              loop
              muted
              playsInline
              poster={wide}
              preload="none"
              src={loopSrc}
            />
          </div>
        </div>

        <div
          className={`min-w-0 ${flip ? "order-1 max-[900px]:order-2" : ""}`}
          data-in={flip ? "peer" : "right"}
        >
          <div
            className={`${MICRO} flex items-baseline justify-between gap-4 border-b border-hairline pb-[clamp(0.6rem,1.6vh,0.9rem)] text-bone/40`}
          >
            <span>{numeral(index)}</span>
            <span>
              {category} · {year}
            </span>
          </div>

          <h2 className="mt-[clamp(1rem,2.5vh,1.75rem)] font-display text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.02] font-[350] tracking-[-0.02em] uppercase">
            {brand}
            <span className="block text-bone/45">{campaign}</span>
          </h2>

          <p className="mt-[clamp(0.85rem,2vh,1.25rem)] max-w-[34ch] text-[clamp(0.875rem,1.05vw,1rem)] leading-[1.7] text-bone/60">
            {highlight}
          </p>

          <span className="relative mt-[clamp(1.25rem,3vh,2rem)] inline-flex items-center gap-[0.7em] overflow-clip border border-bone/45 px-[1.7em] py-[0.95em] text-[clamp(0.625rem,0.75vw,0.75rem)] tracking-[0.18em] whitespace-nowrap text-bone uppercase transition-colors duration-450 ease-[ease] group-hover:border-bone">
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom scale-y-0 bg-bone transition-transform duration-550 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-y-100 motion-reduce:transition-none"
            />

            <Roll
              className="relative"
              label="View Project"
              swapClassName="text-obsidian"
              tall
            />

            <span
              aria-hidden="true"
              className="relative block h-[1em] w-[1em] flex-none overflow-clip transition-colors delay-200 duration-200 ease-[ease] group-hover:text-obsidian motion-reduce:transition-none"
            >
              <ArrowUpRight
                className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-full group-hover:-translate-y-full motion-reduce:transition-none"
                strokeWidth={1.5}
              />
              <ArrowUpRight
                className="absolute inset-0 h-full w-full -translate-x-full translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-0 group-hover:translate-y-0 motion-reduce:transition-none"
                strokeWidth={1.5}
              />
            </span>
          </span>
        </div>
      </Link>
    </li>
  );
}

export default function ArchivePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Archive — L’Ombre",
    description: DESCRIPTION,
    url: `${SITE_URL}/archive`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/projets/${project.slug}`,
        name: `${project.brand} — ${project.campaign}`,
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
                Archive
              </span>
            </h1>
            <p className={`${MICRO} text-bone/45 whitespace-nowrap`}>
              <span className="block" data-line>
                {projects.length} Projets
              </span>
            </p>
          </div>

          <div
            className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[48ch] overflow-clip"
            data-mask
            data-now
          >
            <p
              className="text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.75] text-bone/60"
              data-line
            >
              Every film the studio has released, in the order it was made.
              Three seconds of each — the rest is one click away.
            </p>
          </div>
        </section>

        <ReelStage>

          <ol>
            {projects.map((project, i) => (
              <Row index={i} key={project.id} project={project} />
            ))}
          </ol>
        </ReelStage>
      </Reveal>
    </main>
  );
}
