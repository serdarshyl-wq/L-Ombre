import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Prose from "@/components/Prose";
import Roll from "@/components/Roll";


const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";

const numeral = (i) => String(i + 1).padStart(2, "0");

function Frame({ media, sizes }) {
  if (!media?.url) return null;

  return (
    <figure>
      <div className="overflow-clip" data-curtain>
        <div data-sheet>
          <div data-still>
            <Image
              alt={media.alt ?? ""}
              blurDataURL={media.lqip}
              className="h-auto w-full"
              height={media.height}
              placeholder={media.lqip ? "blur" : "empty"}
              sizes={sizes}
              src={media.url}
              width={media.width}
            />
          </div>
        </div>
      </div>

      {media.caption ? (
        <figcaption className="mt-[clamp(0.6rem,1.6vh,1rem)] text-[clamp(0.6875rem,0.85vw,0.8125rem)] leading-[1.6] text-bone/40">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Fact({ term, children }) {
  if (!children) return null;

  return (
    <div>
      <dt className={`${MICRO} text-bone/35`}>{term}</dt>
      <dd className="mt-[clamp(0.35rem,1vh,0.6rem)] text-[clamp(0.875rem,1.05vw,1rem)] leading-normal text-bone/75">
        {children}
      </dd>
    </div>
  );
}

export default function CaseStudyView({ entry, project }) {
  const { title, standfirst, cover, stats, chapters, craft, tools, quote } =
    entry;

  const hero = cover?.url ?? project?.wide ?? null;

  return (
    <article>

      <header className="px-gutter pt-[clamp(2.5rem,8vh,5rem)]">
        <div
          className={`${MICRO} flex flex-wrap items-baseline gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-2 text-bone/40`}
        >
          <span>Case Study</span>
          {project ? <span>{project.category}</span> : null}
          {project ? <span>{project.year}</span> : null}
        </div>

        <h1
          className="mt-[clamp(1.25rem,3.5vh,2.25rem)] max-w-[16ch] font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-[0.92] font-[350] tracking-[-0.035em]"
          data-now
          data-shutter
        >
          <span className="block" data-line>
            {title}
          </span>
        </h1>

        <div
          className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[62ch] overflow-clip"
          data-mask
          data-now
        >
          <p
            className="text-[clamp(1rem,1.3vw,1.25rem)] leading-[1.75] text-bone/65"
            data-line
          >
            {standfirst}
          </p>
        </div>
      </header>

      {hero ? (
        <div className="mt-[clamp(2.5rem,8vh,5rem)] overflow-clip" data-curtain>
          <div data-sheet>
            <div className="relative aspect-video" data-still>
              <Image
                alt={cover?.alt ?? title}
                blurDataURL={cover?.lqip}
                className="object-cover"
                fill
                placeholder={cover?.lqip ? "blur" : "empty"}
                priority
                sizes="100vw"
                src={hero}
              />
            </div>
          </div>
        </div>
      ) : null}

      {project ? (
        <section
          aria-label="Credits"
          className="mt-[clamp(2.5rem,8vh,5rem)] border-y border-hairline px-gutter py-[clamp(1.75rem,5vh,3rem)]"
          data-rise
        >
          <dl className="grid grid-cols-2 gap-gutter min-[900px]:grid-cols-4">
            <Fact term="Client">{project.client}</Fact>
            <Fact term="Campaign">{`${project.brand} — ${project.campaign}`}</Fact>
            <Fact term="Year">{project.year}</Fact>
            <Fact term="Format">{project.format}</Fact>
          </dl>

          <Link
            className={`${MICRO} group mt-[clamp(1.5rem,4vh,2.25rem)] inline-flex items-center gap-[0.7em] text-bone/70 transition-colors duration-300 ease-[ease] hover:text-bone motion-reduce:transition-none`}
            href={`/projets/${project.slug}`}
          >
            <Roll label="Watch the film" />
            <ArrowUpRight
              className="h-[1.1em] w-[1.1em] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-[0.2em] group-hover:translate-y-[-0.2em] motion-reduce:transition-none"
              strokeWidth={1.5}
            />
          </Link>
        </section>
      ) : null}

      {stats?.length ? (
        <section
          aria-label="By the numbers"
          className="px-gutter py-[clamp(2rem,6vh,3.5rem)]"
        >

          <dl className="grid grid-cols-2 gap-y-[clamp(1.5rem,4vh,2.5rem)] min-[900px]:grid-cols-4">
            {stats.map((stat) => (

              <div
                className="flex flex-col-reverse pr-[clamp(1rem,2vw,2rem)]"
                data-rise
                key={stat._key}
              >
                <dt className={`${MICRO} mt-[clamp(0.4rem,1.2vh,0.75rem)] text-bone/35`}>
                  {stat.label}
                </dt>
                <dd className="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[0.9] font-[350] tracking-[-0.03em]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {chapters?.length ? (
        <div className="px-gutter">
          {chapters.map((chapter, i) => {
            const beside = chapter.layout === "beside" && chapter.media?.url;

            return (
              <section
                className="grid grid-cols-12 gap-x-[clamp(1.5rem,4vw,4.5rem)] gap-y-[clamp(1.5rem,4vh,2.5rem)] border-t border-hairline py-[clamp(3rem,10vh,7rem)]"
                key={chapter._key}
              >
                <div className="col-span-12 min-[900px]:col-span-3">
                  <div
                    className={`${MICRO} flex items-baseline gap-[1.2em] text-bone/40 min-[900px]:sticky min-[900px]:top-[calc(var(--nav-h)+clamp(1.5rem,4vh,2.5rem))] min-[900px]:block`}
                    data-rise
                  >
                    <span className="min-[900px]:block">{numeral(i)}</span>
                    <span className="min-[900px]:mt-[0.9em] min-[900px]:block text-bone/70">
                      {chapter.label}
                    </span>
                  </div>
                </div>

                <div className="col-span-12 min-[900px]:col-span-9">
                  <div className="overflow-clip" data-mask>
                    <h2
                      className="font-display text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.05] font-[350] tracking-tight"
                      data-line
                    >
                      {chapter.heading}
                    </h2>
                  </div>

                  {beside ? (
                    <div className="mt-[clamp(1.5rem,4vh,2.5rem)] grid gap-[clamp(1.5rem,3vw,3rem)] min-[900px]:grid-cols-2 min-[900px]:items-start">
                      <Prose value={chapter.body} />
                      <Frame
                        media={chapter.media}
                        sizes="(max-width: 900px) 100vw, 40vw"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[62ch]">
                        <Prose value={chapter.body} />
                      </div>
                      <div className="mt-[clamp(2rem,6vh,3.5rem)]">
                        <Frame
                          media={chapter.media}
                          sizes="(max-width: 900px) 100vw, 72vw"
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}

      {quote?.text ? (
        <section className="border-y border-hairline px-gutter py-[clamp(4rem,12vh,8rem)]">

          <blockquote className="text-center" data-rise>
            <p
              className={`mx-auto font-display leading-[1.22] font-[350] tracking-tight ${quote.text.length > 120
                  ? "max-w-[24em] text-[clamp(1.25rem,2.8vw,2.25rem)]"
                  : "max-w-[13em] text-[clamp(1.5rem,4vw,3.25rem)]"
                }`}
            >
              {quote.text}
            </p>
            {quote.attribution ? (
              <cite
                className={`${MICRO} mt-[clamp(1.25rem,3.5vh,2.25rem)] block text-bone/40 not-italic`}
              >
                {quote.attribution}
              </cite>
            ) : null}
          </blockquote>
        </section>
      ) : null}

      {craft?.length ? (
        <section
          aria-labelledby="cs-craft"
          className="px-gutter pt-[clamp(3rem,9vh,6rem)]"
        >
          <div className="overflow-clip" data-mask="left">
            <h2 className={`${MICRO} text-bone/40`} data-line id="cs-craft">
              The Craft
            </h2>
          </div>

          <dl className="mt-[clamp(1.5rem,4vh,2.5rem)]">
            {craft.map((note) => (
              <div
                className="grid grid-cols-12 gap-x-[clamp(1.5rem,4vw,4.5rem)] gap-y-2 border-t border-hairline py-[clamp(1.1rem,3vh,1.75rem)]"
                data-rise
                key={note._key}
              >
                <dt className="col-span-12 font-display text-[clamp(1rem,1.5vw,1.375rem)] leading-[1.3] font-[350] min-[700px]:col-span-4">
                  {note.discipline}
                </dt>
                <dd className="col-span-12 max-w-[54ch] text-[clamp(0.875rem,1.05vw,1rem)] leading-[1.7] text-bone/60 min-[700px]:col-span-8">
                  {note.note}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {tools?.length ? (
        <section
          aria-labelledby="cs-tools"
          className="px-gutter pt-[clamp(2.5rem,7vh,4.5rem)]"
        >
          <div className="overflow-clip" data-mask="left">
            <h2 className={`${MICRO} text-bone/40`} data-line id="cs-tools">
              On the Bench
            </h2>
          </div>

          <ul
            className="mt-[clamp(1rem,2.6vh,1.6rem)] flex flex-wrap gap-x-[clamp(1rem,2.5vw,2.25rem)] gap-y-[0.6rem]"
            data-rise
          >
            {tools.map((tool) => (
              <li
                className="border-l border-hairline pl-[clamp(1rem,2.5vw,2.25rem)] text-[clamp(0.8125rem,1vw,0.9375rem)] leading-normal text-bone/60 first:border-l-0 first:pl-0"
                key={tool}
              >
                {tool}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
