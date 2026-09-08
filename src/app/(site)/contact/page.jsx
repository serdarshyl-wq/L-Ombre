import Offices from "@/components/Offices";
import Reveal from "@/components/Reveal";
import { ORG } from "@/lib/schema";


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "Contact L’Ombre — four studios across Paris, Munich, Amsterdam and London. New projects, press and collaborations.";

export const metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Contact — L’Ombre",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — L’Ombre",
    description: DESCRIPTION,
  },
};

const OFFICES = [
  {
    city: "Paris",
    address: "12 rue Oberkampf, 75011",
    phone: "+33 1 84 80 12 40",
    email: "paris@lombre.studio",
    zone: "Europe/Paris",
  },
  {
    city: "Munich",
    address: "Barer Straße 44, 80799",
    phone: "+49 89 21 09 44 60",
    email: "munich@lombre.studio",
    zone: "Europe/Berlin",
  },
  {
    city: "Amsterdam",
    address: "Prinsengracht 263, 1016",
    phone: "+31 20 808 15 32",
    email: "amsterdam@lombre.studio",
    zone: "Europe/Amsterdam",
  },
  {
    city: "London",
    address: "70 Rivington Street, EC2A",
    phone: "+44 20 3966 41 08",
    email: "london@lombre.studio",
    zone: "Europe/London",
  },
];

const DESKS = [
  {
    label: "New Project Requests",
    email: "bonjour@lombre.studio",
    place: "col-start-2 row-start-1",
  },
  {
    label: "Careers",
    email: "carrieres@lombre.studio",
    place: "col-start-1 row-start-2",
  },
  {
    label: "PR & Collaborations",
    email: "presse@lombre.studio",
    place: "col-start-2 row-start-2",
  },
  {
    label: "Freelance & Suppliers",
    email: "freelance@lombre.studio",
    place: "col-start-3 row-start-2",
  },
];

const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — L’Ombre",
    description: DESCRIPTION,
    url: `${SITE_URL}/contact`,
    // Dört büro ve masa adresleri sayfada duruyor ama işaretlemeye
    // girmiyorlar. Telefon numaraları gerçek biçimde ve tahsisli
    // aralıklardan; sokak adresleri de gerçek binalar. Bunları `Place` ve
    // `telephone` olarak beyan etmek, var olmayan bir işletmeyi gerçek
    // konumlara ve muhtemelen başkasına ait numaralara bağlamak olurdu.
    mainEntity: ORG,
  };

  return (
    <main className="pt-(--nav-h)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <section
          aria-labelledby="ct-title"
          className="flex min-h-[calc(100svh-var(--nav-h))] flex-col gap-[clamp(1rem,3.5vh,2rem)] px-gutter pt-[clamp(1.25rem,4vh,2.5rem)] pb-[clamp(1.25rem,4vh,2.5rem)]"
        >
          <div
            className={`${MICRO} flex items-baseline justify-between gap-6 text-bone/45`}
          >
            <h1 id="ct-title">Contact</h1>
            <p lang="fr">Quatre Bureaux</p>
          </div>

          <Offices offices={OFFICES} />
        </section>

        <section
          aria-labelledby="ct-desks"
          className="grid min-h-svh grid-cols-3 content-center gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(3rem,11vh,7rem)] border-t border-hairline px-gutter py-[clamp(4rem,10vh,7rem)] max-[900px]:grid-cols-1 max-[900px]:gap-y-[clamp(2.5rem,7vh,4rem)]"
        >
          <h2 className="sr-only" id="ct-desks">
            Direct addresses
          </h2>

          {DESKS.map(({ label, email, place }) => (

            <div
              className={`${place} text-center max-[900px]:col-start-auto max-[900px]:row-start-auto`}
              data-rise
              key={email}
            >
              <p className={`${MICRO} text-bone/45`}>{label}:</p>

              <a
                className="ct__link mt-[clamp(0.6rem,1.6vh,1rem)] font-display text-[clamp(1.25rem,2.6vw,2.75rem)] leading-[1.1] font-[350] tracking-[-0.015em] break-all"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </div>
          ))}
        </section>
      </Reveal>
    </main>
  );
}
