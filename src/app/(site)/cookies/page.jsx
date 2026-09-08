import Link from "next/link";
import Legal, { Section } from "@/components/Legal";

const DESCRIPTION =
  "This site sets no cookies and writes nothing to your browser. There is no banner because there is nothing to consent to.";

export const metadata = {
  title: "Cookies",
  description: DESCRIPTION,
  alternates: { canonical: "/cookies" },
  openGraph: {
    type: "website",
    url: "/cookies",
    title: "Cookies — L’Ombre",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookies — L’Ombre",
    description: DESCRIPTION,
  },
};

export default function CookiesPage() {
  return (
    <Legal
      lede="There is no cookie banner on this site because there is nothing to consent to."
      title="Cookies"
      updated="8 September 2026"
    >
      <Section title="No cookies are set">
        <p>
          Browse any page here and your browser will be handed no cookies at
          all. Nothing is written to local storage or session storage either.
          This was checked across every page of the site, not assumed.
        </p>
      </Section>

      <Section title="No measurement, no advertising">
        <p>
          There is no analytics script, no advertising or remarketing tag, no
          social embed, and no third-party font or player. Every asset — type,
          images, video — is served from this domain. Nothing on these pages
          causes your browser to contact another company’s server.
        </p>
      </Section>

      <Section title="The one exception, and it isn’t yours">
        <p>
          The Journal is published through an editor that lives at{" "}
          <code>/admin</code>. It is not part of the public site, it is kept out
          of search engines, and it requires a login. Once signed in, it stores
          what that session and its own interface need. You will not run into it
          while reading the site.
        </p>
      </Section>

      <Section title="If this ever changes">
        <p>
          If a cookie is introduced — for a measurement tool, say — this page
          will describe it before it appears, and a consent notice will be shown
          wherever consent is required. Until then, the honest version of this
          page is short.
        </p>
        <p>
          What the site does collect, it collects through the contact form only.
          That is set out in the{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </Section>
    </Legal>
  );
}
