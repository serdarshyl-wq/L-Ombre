import Link from "next/link";


export default function ProjectCard({ project }) {
  const { id, slug, brand, campaign, category, videoSrc, poster, wide } =
    project;

  return (

    <article className="card" data-card data-wide={wide}>

      <Link
        className="card__link"
        href={`/projets/${slug}`}
        aria-label={`${brand} — ${campaign}`}
      >
        <div className="card__frame">
          <video
            className="card__video"
            data-video
            src={videoSrc}
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            aria-hidden="true"
          />

          <p className="card__id">{id}</p>
        </div>

        <div className="card__meta">
          <h3 className="card__brand">
            <span data-reveal>{brand}</span>
          </h3>
          <p className="card__campaign" lang="fr">
            <span data-reveal>{campaign}</span>
          </p>
          <p className="card__category">
            <span data-reveal>{category}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
