import Link from "next/link";
import Legal, { Section } from "@/components/Legal";

const DESCRIPTION =
  "L’Ombre is a fictional studio and this site is a showcase. What that means for the work shown, the marks that appear in it, and the site itself.";

export const metadata = {
  title: "Terms of Use",
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: "/terms",
    title: "Terms of Use — L’Ombre",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use — L’Ombre",
    description: DESCRIPTION,
  },
};

export default function TermsPage() {
  return (
    <Legal
      lede="A short page, because this is a showcase and not a shop."
      title="Terms"
      updated="8 September 2026"
    >
      <Section title="What this site is">
        <p>
          L’Ombre is a fictional studio, invented for this piece. The site is a
          demonstration of custom design and front-end engineering. No service
          is offered, sold or performed under the L’Ombre name, and no agreement
          can be entered into with it.
        </p>
      </Section>

      <Section title="The work shown">
        <p>
          The projects, case studies and journal entries are spec work —
          self-initiated, made to show craft rather than to fulfil a brief.
        </p>
        <p>
          Brand names, logos and trademarks that appear belong to their
          respective owners. Their presence does not indicate a commission, a
          client relationship, an endorsement or any affiliation whatsoever. If
          you hold one of these marks and would rather it were not shown, say so
          through the <Link href="/contact">contact form</Link> and it will be
          taken down.
        </p>
      </Section>

      <Section title="The site itself">
        <p>
          The design, the code and the writing here are the work of their
          author. You are welcome to look closely, learn from it and link to it.
          Lifting it wholesale and presenting it as your own is a different
          thing, and not welcome.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          The site is provided as it is. It may be changed, moved or taken down
          at any time, and nothing on it is professional advice of any kind.
        </p>
      </Section>

      <Section title="Getting in touch">
        <p>
          The <Link href="/contact">contact form</Link> works and is read by a
          real person. The email addresses and telephone numbers printed
          elsewhere on the site belong to the fiction — they connect to nothing,
          which is why selecting one opens a note rather than your mail app.
        </p>
        <p>
          For anything real, that form or{" "}
          <a href="https://temnyy.dev/" rel="noreferrer" target="_blank">
            temnyy.dev
          </a>{" "}
          is the way.
        </p>
      </Section>
    </Legal>
  );
}
