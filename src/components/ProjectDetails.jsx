
export default function ProjectDetails({ project }) {
  const { approach, services, credits, brand, campaign } = project;

  return (
    <div className="pjd">
      <section className="pjd__block" aria-labelledby="pjd-approach">
        <h2 className="pjd__label" id="pjd-approach">
          Approach
        </h2>
        <p className="pjd__prose">{approach}</p>
      </section>

      <section className="pjd__block" aria-labelledby="pjd-services">
        <h2 className="pjd__label" id="pjd-services">
          Services
        </h2>
        <ul className="pjd__services">
          {services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      </section>

      <section className="pjd__block" aria-labelledby="pjd-credits">
        <h2 className="pjd__label" id="pjd-credits">
          Credits
        </h2>
        <dl className="pjd__credits">
          {credits.map(({ role, name }) => (
            <div key={role}>
              <dt>{role}</dt>
              <dd>{name}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="pjd__colophon" lang="fr">
        {brand} — {campaign} · L’Ombre
      </p>
    </div>
  );
}
