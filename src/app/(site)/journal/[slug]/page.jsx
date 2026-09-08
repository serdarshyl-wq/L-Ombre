import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ArticleView from "@/components/ArticleView";
import CaseStudyView from "@/components/CaseStudyView";
import Reveal from "@/components/Reveal";
import Roll from "@/components/Roll";
import { getEntry, getNext, getSlugs } from "@/sanity/lib/journal";
import { ORG, abs } from "@/lib/schema";



export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs.map((slug) => ({ slug }));
}

const clip = (text, max = 155) => {
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) return {};

  const description = clip(entry.standfirst ?? entry.excerpt);
  const url = `/journal/${slug}`;
  const image = entry.cover?.url ?? entry.linked?.wide;

  return {
    title: entry.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: entry.title,
      description,
      publishedTime: entry.publishedAt,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function JournalEntryPage({ params }) {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) notFound();

  const isCase = entry._type === "caseStudy";
  const next = await getNext(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: clip(entry.standfirst ?? entry.excerpt),
    datePublished: entry.publishedAt,
    url: `${SITE_URL}/journal/${slug}`,
    // Sanity görselleri zaten mutlak; yerel poster yolları değildi.
    image: abs(entry.cover?.url ?? entry.linked?.wide),
    author: ORG,
    publisher: ORG,
    ...(entry.linked
      ? {
        about: {
          "@type": "CreativeWork",
          name: `${entry.linked.brand} — ${entry.linked.campaign}`,
          url: `${SITE_URL}/projets/${entry.linked.slug}`,
        },
      }
      : {}),
  };

  return (
    <main className="pt-(--nav-h)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        {isCase ? (
          <CaseStudyView entry={entry} project={entry.linked} />
        ) : (
          <ArticleView entry={entry} />
        )}

        <nav
          aria-label="Journal"
          className="mt-[clamp(3rem,9vh,6rem)] flex flex-wrap items-baseline justify-between gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(1.5rem,4vh,2.5rem)] border-t border-hairline px-gutter py-[clamp(2rem,6vh,3.5rem)]"
        >
          <Link
            className={`${MICRO} group inline-flex items-center gap-[0.7em] text-bone/60 transition-colors duration-300 ease-[ease] hover:text-bone motion-reduce:transition-none`}
            href="/journal"
          >
            <ArrowLeft
              className="h-[1.1em] w-[1.1em] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-[-0.25em] motion-reduce:transition-none"
              strokeWidth={1.5}
            />
            <Roll label="All entries" />
          </Link>

          {next ? (
            <Link
              className="group max-w-[32ch] text-right"
              href={`/journal/${next.slug}`}
            >
              <span className={`${MICRO} block text-bone/35`}>Next</span>
              <span className="mt-[clamp(0.4rem,1.2vh,0.7rem)] flex items-baseline justify-end gap-[0.5em] font-display text-[clamp(1.125rem,2.2vw,1.875rem)] leading-[1.15] font-[350] tracking-[-0.02em] text-bone/70 transition-colors duration-300 ease-[ease] group-hover:text-bone motion-reduce:transition-none">
                {next.title}
                <ArrowUpRight
                  className="h-[0.8em] w-[0.8em] flex-none transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-[0.2em] group-hover:translate-y-[-0.2em] motion-reduce:transition-none"
                  strokeWidth={1.5}
                />
              </span>
            </Link>
          ) : null}
        </nav>
      </Reveal>
    </main>
  );
}
