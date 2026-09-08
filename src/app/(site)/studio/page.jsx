import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import Roll from "@/components/Roll";
import Stack from "@/components/Stack";
import { ORG } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "L’Ombre is an advertising and creative studio in Paris. Direction, film, CGI and sound — twelve people, one room, every frame passing the same pair of eyes twice.";

export const metadata = {
  title: "Studio",
  description: DESCRIPTION,
  alternates: { canonical: "/studio" },
  openGraph: {
    type: "website",
    url: "/studio",
    title: "Studio — L’Ombre",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio — L’Ombre",
    description: DESCRIPTION,
  },
};


const MANIFESTO = [
  "An image is not",
  "what you show —",
  "it is what you",
  "leave out.",
];

const FACTS = [
  { label: "Founded", value: "2014" },
  { label: "Based", value: "Paris, 11e" },
  { label: "Collective", value: "Twelve" },
  { label: "Disciplines", value: "Four" },
];

const SENSES = [
  "The dark shape a body leaves when it stands between a thing and the light.",
  "In a frame: the part the eye arrives at last, and keeps the longest.",
];

const PRINCIPLES = [
  {
    title: "Restraint",
    body: "A luxury film is not a full one. We cut until only what is necessary remains, then cut once more. Whatever survives that is the idea.",
  },
  {
    title: "Tension",
    body: "Beauty without tension is decoration. Every piece keeps something unresolved — a frame held too long, a beat that never lands, a colour that refuses to settle.",
  },
  {
    title: "Finish",
    body: "The last five percent is the entire job. Grade, sound and rhythm are not post-production; they are where the film actually happens.",
  },
];

const PRACTICE = [
  {
    group: "Direction",
    items: ["Creative Direction", "Art Direction", "Concept & Script", "Casting"],
  },
  {
    group: "Production",
    items: [
      "Film Production",
      "Cinematography",
      "Location & Set",
      "Still Photography",
    ],
  },
  {
    group: "Post",
    items: ["CGI & VFX", "Colour Grading", "Editorial", "Sound Design & Score"],
  },
];

const SERVICES = PRACTICE.reduce((total, { items }) => total + items.length, 0);

const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";


const DIM = "text-bone/65";

const numeral = (i) => String(i + 1).padStart(2, "0");


function Head({ id, title, note, lang }) {
  return (
    <div className="flex items-baseline justify-between gap-6" data-rise>
      <h2
        className="text-[clamp(2rem,5vw,4.5rem)] leading-none font-[350] tracking-[0.02em] uppercase"
        id={id}
        lang={lang}
      >
        {title}
      </h2>
      <p className={`${MICRO} text-bone/45 whitespace-nowrap`}>{note}</p>
    </div>
  );
}

export default function StudioPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Studio — L’Ombre",
    description: DESCRIPTION,
    url: `${SITE_URL}/studio`,
    mainEntity: {
      ...ORG,
      knowsAbout: PRACTICE.flatMap(({ items }) => items),
    },
  };

  return (
    <main className="pt-(--nav-h)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <section
          aria-labelledby="st-manifesto"
          className="flex min-h-[calc(100svh-var(--nav-h))] flex-col justify-between gap-[clamp(3rem,12vh,8rem)] px-gutter pt-[clamp(2rem,7vh,4.5rem)] pb-[clamp(3rem,10vh,6rem)]"
        >
          <div
            className={`${MICRO} flex items-baseline justify-between gap-6 text-bone/45`}
            data-now
            data-rise
          >
            <p>Studio</p>
            <p lang="fr">Paris — Est. MMXIV</p>
          </div>

          <h1
            className="font-display text-[clamp(2.5rem,8vw,10.5rem)] leading-[0.92] font-[350] tracking-[-0.03em] uppercase"
            data-now
            data-shutter
            id="st-manifesto"
          >
            {MANIFESTO.map((line) => (
              <span className="block" data-line key={line}>
                {line}
              </span>
            ))}
          </h1>
        </section>

        <section
          aria-labelledby="st-about"
          className="overflow-clip border-t border-hairline px-gutter py-[clamp(4rem,12vh,9rem)]"
        >
          <Head id="st-about" note="Depuis 2014" title="Le Studio" />

          <div className="mt-[clamp(2.5rem,8vh,5.5rem)] grid grid-cols-[1fr_1.7fr] items-start gap-[clamp(2rem,6vw,6rem)] max-[900px]:grid-cols-1 max-[900px]:gap-[clamp(2.5rem,7vh,4rem)]">
            <dl className={`${MICRO} grid gap-0`} data-in="left">
              {FACTS.map(({ label, value }) => (
                <div
                  className="flex items-baseline justify-between gap-4 border-b border-hairline py-[clamp(0.75rem,2vh,1.15rem)]"
                  key={label}
                >
                  <dt className="text-bone/40">{label}</dt>
                  <dd className="text-bone/85">{value}</dd>
                </div>
              ))}
            </dl>

            <div
              className="grid gap-[clamp(1.75rem,4vh,2.75rem)]"
              data-in="right"
            >
              <p className="max-w-[26ch] font-display text-[clamp(1.5rem,3.2vw,3rem)] leading-[1.22] font-[350] tracking-[-0.015em]">
                L’Ombre is an advertising and creative studio in Paris. We
                direct, shoot and finish film for brands that would rather be
                felt than explained.
              </p>

              <p
                className={`${DIM} max-w-[54ch] text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.75]`}
              >
                Founded in 2014 by a director and a colourist who were tired of
                handing over the last ten percent. The studio stayed small on
                purpose — twelve people, one room, every frame passing the same
                pair of eyes twice.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="st-name"
          className="border-t border-hairline px-gutter py-[clamp(4rem,12vh,9rem)]"
        >
          <div
            className="flex flex-wrap items-baseline gap-x-[clamp(1rem,3vw,2.5rem)] gap-y-3"
            data-shutter
          >
            <h2
              className="font-display text-[clamp(3rem,11vw,13rem)] leading-[0.86] font-[350] tracking-[-0.035em]"
              id="st-name"
              lang="fr"
            >
              <span className="block" data-line>
                l’ombre
              </span>
            </h2>
            <p className={`${MICRO} text-bone/45`} lang="fr">
              <span className="block" data-line>
                /ɔ̃bʁ/ · nom féminin
              </span>
            </p>
          </div>
          <ol className="mt-[clamp(2.5rem,8vh,5rem)] grid gap-0">
            {SENSES.map((sense, i) => (
              <li
                className="grid grid-cols-[auto_1fr] items-start gap-[clamp(1.25rem,4vw,3rem)] border-t border-hairline py-[clamp(1.25rem,3.5vh,2.25rem)]"
                data-mask
                key={sense}
              >
                <div className="mt-[0.45em] overflow-clip">
                  <span className={`${MICRO} block text-bone/40`} data-line>
                    {numeral(i)}
                  </span>
                </div>

                <div className="overflow-clip">
                  <p
                    className="max-w-[44ch] font-display text-[clamp(1.125rem,2.1vw,1.875rem)] leading-[1.35] font-[350]"
                    data-line
                  >
                    {sense}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div
            className="mt-[clamp(2.5rem,7vh,4.5rem)] ml-auto max-w-[42ch] overflow-clip"
            data-mask
          >
            <p
              className={`${DIM} text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.75]`}
              data-line
            >
              We took the name as a working method. Subtract before you add. One
              idea to a frame. Everything else stays in the dark.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="st-principles"
          className="border-t border-hairline pt-[clamp(4rem,12vh,9rem)]"
        >
          <div className="px-gutter pb-[clamp(2.5rem,8vh,5.5rem)]">
            <Head id="st-principles" note="03 Rules" title="Principes" />
          </div>

          <Stack>
            <ol className="stack__list">
              {PRINCIPLES.map(({ title, body }, i) => (
                <li className="stack__panel" data-panel key={title}>
                  <div className="stack__inner" data-panel-inner>
                    <div className="flex items-baseline justify-between gap-6 border-b border-hairline pb-[clamp(0.75rem,2vh,1.15rem)]">
                      <span className={`${MICRO} text-bone/40`}>
                        {numeral(i)}
                      </span>
                      <span className={`${MICRO} text-bone/40`} lang="fr">
                        Principe
                      </span>
                    </div>

                    <div className="my-auto grid gap-[clamp(1.5rem,4vh,2.5rem)]">
                      <h3 className="font-display text-[clamp(2.5rem,10vw,9rem)] leading-[0.92] font-[350] tracking-[-0.03em] uppercase">
                        {title}
                      </h3>
                      <p
                        className={`${DIM} max-w-[46ch] text-[clamp(1rem,1.3vw,1.25rem)] leading-[1.7]`}
                      >
                        {body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Stack>
        </section>

        <section
          aria-labelledby="st-practice"
          className="border-t border-hairline px-gutter py-[clamp(4rem,12vh,9rem)]"
        >
          <Head
            id="st-practice"
            note={`${SERVICES} Services`}
            title="Pratique"
          />

          <div className="mt-[clamp(2.5rem,8vh,5.5rem)] grid grid-cols-3 gap-[clamp(1.5rem,4vw,4rem)] max-[820px]:grid-cols-1 max-[820px]:gap-[clamp(2.5rem,6vh,3.5rem)]">
            {PRACTICE.map(({ group, items }) => (
              <div key={group}>
                <div className="overflow-clip" data-mask="left">
                  <p className={`${MICRO} block text-bone/40`} data-line>
                    {group}
                  </p>
                </div>

                <ul
                  className="mt-[clamp(1rem,2.5vh,1.75rem)] grid gap-0 text-[clamp(1rem,1.45vw,1.375rem)]"
                  data-mask
                >
                  {items.map((item) => (
                    <li
                      className="overflow-clip border-b border-hairline"
                      key={item}
                    >
                      <span
                        className="block py-[clamp(0.6rem,1.6vh,0.9rem)] text-bone/85"
                        data-line
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="st-contact"
          className="border-t border-hairline px-gutter py-[clamp(5rem,16vh,11rem)]"
        >
          <div className="overflow-clip" data-mask="left">
            <p className={`${MICRO} block text-bone/45`} data-line>
              New business
            </p>
          </div>

          <h2
            className="mt-[clamp(1.5rem,4vh,2.5rem)] font-display text-[clamp(2.5rem,9vw,11rem)] leading-[1.05] font-[350] tracking-[-0.03em] uppercase"
            data-wipe
            id="st-contact"
          >
            <a
              className="group inline-flex items-center gap-[clamp(0.75rem,1.6vw,1.5rem)]"
              href="mailto:bonjour@lombre.studio"
            >
              <Roll label="Let’s Talk" tall />

              <span
                aria-hidden="true"
                className="relative block h-[0.62em] w-[0.62em] flex-none overflow-clip"
              >
                <ArrowUpRight
                  className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-full group-hover:-translate-y-full motion-reduce:transition-none"
                  strokeWidth={1}
                />
                <ArrowUpRight
                  className="absolute inset-0 h-full w-full -translate-x-full translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-0 group-hover:translate-y-0 motion-reduce:transition-none"
                  strokeWidth={1}
                />
              </span>
            </a>
          </h2>

          <div
            className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[38ch] overflow-clip"
            data-mask="left"
          >
            <p
              className="text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.75] text-bone/55"
              data-line
            >
              A line is enough to start. We read everything ourselves and answer
              within two days.
            </p>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
