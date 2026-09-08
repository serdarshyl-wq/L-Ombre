import { client } from "./client";
import projects from "@/data/projects.json";

const IMAGE = `{
  alt,
  caption,
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip
}`;

const CARD = `{
  _id,
  _type,
  title,
  "slug": slug.current,
  publishedAt,
  featured,
  kicker,
  excerpt,
  standfirst,
  project,
  cover ${IMAGE}
}`;

const ENTRY = `{
  ...,
  "slug": slug.current,
  cover ${IMAGE},
  chapters[]{ ..., media ${IMAGE} },
  body[]{ ..., _type == "figure" => ${IMAGE} }
}`;

const ORDER = "order(featured desc, publishedAt desc)";

const linked = (entry) =>
  entry?._type === "caseStudy"
    ? (projects.find((project) => project.slug === entry.project) ?? null)
    : null;

const toCard = (entry) => {
  const project = linked(entry);

  return {
    id: entry._id,
    kind: entry._type === "caseStudy" ? "case-study" : "culture",
    slug: entry.slug,
    title: entry.title,
    blurb: entry.standfirst ?? entry.excerpt ?? "",
    label: entry._type === "caseStudy" ? "Case Study" : (entry.kicker ?? "Culture & Vision"),
    date: entry.publishedAt,
    cover: entry.cover?.url ? entry.cover : null,
    fallback: project?.wide ?? null,
    meta: project ? `${project.brand} — ${project.campaign}` : null,
  };
};

export async function getCards() {
  const entries = await client.fetch(
    `*[_type in ["caseStudy","journal"] && defined(slug.current)] | ${ORDER} ${CARD}`
  );

  return entries.map(toCard);
}

export async function getSlugs() {
  return client.fetch(
    `*[_type in ["caseStudy","journal"] && defined(slug.current)].slug.current`
  );
}

export async function getEntry(slug) {
  const entry = await client.fetch(
    `*[_type in ["caseStudy","journal"] && slug.current == $slug][0] ${ENTRY}`,
    { slug }
  );

  if (!entry) return null;

  return { ...entry, linked: linked(entry) };
}

export async function getNext(slug) {
  const cards = await getCards();
  if (cards.length < 2) return null;

  const i = cards.findIndex((card) => card.slug === slug);
  if (i < 0) return null;

  return cards[(i + 1) % cards.length];
}
