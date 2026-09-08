import { ArrowDown } from "lucide-react";

export const SLOGANS = ["L’Émotion Pure", "La Passion Brute", "L’Art Éternel"];

export default function ThresholdPlate({ tone, primary = false }) {
  const Mark = primary ? "h1" : "p";

  return (
    <div className={`plate plate--${tone}`} aria-hidden={primary ? undefined : "true"}>
      <div className="plate__rail">
        <p className="plate__sig" lang="fr">
          L’Ombre
        </p>
        <p className="plate__meta">
          Paris <span aria-hidden="true">·</span> MMXXIV
        </p>
      </div>

      <div className="plate__center">
        {SLOGANS.map((slogan, i) => (
          <p key={slogan} className="plate__slogan" data-slogan={i} lang="fr">
            {slogan}
          </p>
        ))}

        <Mark
          className="plate__mark"
          data-wordmark
          lang="fr"
          id={primary ? "wordmark" : undefined}
        >
          L’Ombre
        </Mark>
      </div>

      <div className="plate__rail plate__rail--foot">
        <p className="plate__lede">
          We give form to what lives in the shadow — brand, film and digital
          experience.
        </p>
        <p className="plate__cue">
          <span>Scroll</span>
          <ArrowDown
            className="plate__cue-icon"
            strokeWidth={1.25}
            aria-hidden="true"
          />
        </p>
      </div>
    </div>
  );
}
