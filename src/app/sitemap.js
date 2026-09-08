import projects from "@/data/projects.json";
import { getCards } from "@/sanity/lib/journal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap() {

  const entries = await getCards();

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/studio`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/archive`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/journal`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.7 },
    ...["cookies", "terms", "privacy"].map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: "yearly",
      priority: 0.2,
    })),
    ...projects.map(({ slug }) => ({
      url: `${SITE_URL}/projets/${slug}`,
      changeFrequency: "yearly",
      priority: 0.8,
    })),
    ...entries.map(({ slug, date }) => ({
      url: `${SITE_URL}/journal/${slug}`,
      lastModified: date ? new Date(date) : undefined,
      changeFrequency: "yearly",
      priority: 0.7,
    })),
  ];
}
