import FooterCategory from "@/components/FooterCategory";
import FooterLink from "@/components/FooterLink";


const SOCIALS = [
  { label: "Instagram" },
  { label: "YouTube" },
  { label: "Facebook" },
  { label: "X" },
];

const EMAILS = [
  { note: "New business", address: "bonjour@lombre.studio" },
  { note: "Press", address: "presse@lombre.studio" },
];

const ARCHIVE = [
  { label: "Tom Ford", href: "/projets/tom-ford-or-liquide" },
  { label: "YSL", href: "/projets/ysl-la-nuit" },
  { label: "Cadillac", href: "/projets/cadillac-lyriq-noire" },
];

const JOURNAL = [
  { label: "All Entries", href: "/journal" },
  { label: "Case Studies", href: "/journal?filter=case-study" },
  { label: "Culture & Vision", href: "/journal?filter=culture" },
];

const LEGAL = [
  { label: "Cookies", href: "/cookies" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const HEADING =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase opacity-40";

const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.18em] uppercase";

export default function Footer() {

  const year = new Date().getFullYear();


  return (
    <footer className="grid min-h-svh grid-rows-[1fr_auto] overflow-clip border-t border-hairline">

      <div className="flex items-center px-gutter py-[clamp(3rem,8vh,6rem)]">
        <p
          className="font-display text-[clamp(3.5rem,22vw,32rem)] leading-[0.78] font-[350] tracking-[-0.045em] whitespace-nowrap uppercase"
          lang="fr"
        >
          L’Ombre
        </p>
      </div>

      <div className="px-gutter">

        <div className="foot__cols">

          <FooterCategory className="grid-cols-2" title="Socials">
            {SOCIALS.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </FooterCategory>

          <FooterCategory title="Archive">
            {ARCHIVE.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </FooterCategory>

          <FooterCategory title="Studio">
            <li>
              <FooterLink href="/studio">About Us</FooterLink>
            </li>
          </FooterCategory>

          <FooterCategory title="Journal">
            {JOURNAL.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </FooterCategory>

          <ul className="foot__contact grid gap-[clamp(0.85rem,2vh,1.25rem)]">
            {EMAILS.map(({ note, address }) => (
              <li key={address}>
                <p className={`${HEADING} mb-1`}>{note}</p>
                <FooterLink
                  className="text-[clamp(0.875rem,1.05vw,1rem)] break-all"
                  href={`mailto:${address}`}
                >
                  {address}
                </FooterLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="foot__meta">
          <p className={`${MICRO} opacity-40`}>
            © {year} L’Ombre — All rights reserved
          </p>

          <ul className={`${MICRO} foot__legal`}>
            {LEGAL.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </ul>

          <p className={`${MICRO} foot__made`}>
            <FooterLink href="https://temnyy.dev/">Made by Temnyy</FooterLink>
          </p>
        </div>
      </div>
    </footer>
  );
}
