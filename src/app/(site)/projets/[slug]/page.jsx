import { notFound } from "next/navigation";
import ProjectHero from "@/components/ProjectHero";
import projects from "@/data/projects.json";
import { ORG, abs } from "@/lib/schema";

const find = (slug) => projects.find((p) => p.slug === slug);

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = find(slug);
  if (!project) return {};

  const title = `${project.brand} — ${project.campaign}`;

  return {
    title,
    description: project.summary,
    alternates: { canonical: `/projets/${slug}` },
    openGraph: {
      type: "article",
      url: `/projets/${slug}`,
      title,
      description: project.summary,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = find(slug);

  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${project.brand} — ${project.campaign}`,
    description: project.summary,
    // Şemadaki URL alanları mutlak olmak zorunda; `/videos/...` göreli yolu
    // doğrulanamıyordu.
    thumbnailUrl: abs(project.poster),
    contentUrl: abs(project.fullSrc),
    uploadDate: `${project.year}-01-01`,
    creator: ORG,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectHero project={project} />
    </main>
  );
}
