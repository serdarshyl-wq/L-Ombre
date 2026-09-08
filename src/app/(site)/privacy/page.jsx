import Link from "next/link";
import Legal, { Section } from "@/components/Legal";

const DESCRIPTION =
  "What this site collects, what it does not, and where a message from the contact form actually goes.";

export const metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "/privacy",
    title: "Privacy Policy — L’Ombre",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — L’Ombre",
    description: DESCRIPTION,
  },
};

export default function PrivacyPage() {
  return (
    <Legal
      lede="This site collects almost nothing. Here is exactly what it does collect, and where it goes."
      title="Privacy"
      updated="8 September 2026"
    >
      <Section title="What this site is">
        <p>
          L’Ombre is a fictional studio, invented for this piece. The site is a
          demonstration of design and engineering, built and run by an
          independent developer at{" "}
          <a href="https://temnyy.dev/" rel="noreferrer" target="_blank">
            temnyy.dev
          </a>
          . Nothing is sold here, and no client work is taken under the L’Ombre
          name.
        </p>
      </Section>

      <Section title="What the site collects on its own">
        <p>
          Nothing. No cookies are set. Nothing is written to your browser’s
          local or session storage. No request leaves for a third-party server —
          every font, image and video is served from this domain, so no one else
          sees that you were here.
        </p>
        <p>
          There is no analytics, no advertising or remarketing tag, no social
          embed and no tracking pixel.
        </p>
      </Section>

      <Section title="The contact form">
        <p>
          This is the only place data is collected, and only because you chose to
          type it: your <strong>name</strong>, <strong>email address</strong>,{" "}
          <strong>company</strong> (optional) and your{" "}
          <strong>message</strong>. They are used for one thing — to read what
          you wrote and reply to it.
        </p>
        <p>
          The message is delivered by Resend, an email service, processed in the
          European Union (Ireland), and arrives in a personal mailbox. Open
          tracking and click tracking are switched off, so nothing reports back
          when the message is read.
        </p>
        <p>
          The form also carries one hidden field that automated spam tends to
          fill in. If you are a person, you never see it and never fill it.
        </p>
      </Section>

      <Section title="Hosting">
        <p>
          The site is hosted by Vercel. Like any web host, Vercel handles and
          logs the requests it serves — IP address, browser and the page asked
          for — in order to deliver the site and protect it from abuse.
        </p>
      </Section>

      <Section title="How long anything is kept">
        <p>
          Messages stay in the mailbox for as long as the conversation is useful,
          and no longer. Ask, and yours is deleted.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask what is held about you, ask for it to be corrected, or ask
          for it to be erased. Use the{" "}
          <Link href="/contact">contact form</Link> or write through{" "}
          <a href="https://temnyy.dev/" rel="noreferrer" target="_blank">
            temnyy.dev
          </a>
          . There is no queue — it reaches one person.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If any of the above stops being true, this page changes with it. The
          date at the top is the day it last did.
        </p>
      </Section>
    </Legal>
  );
}
