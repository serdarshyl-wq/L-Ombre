"use client";

import { useId, useState } from "react";
import LocalTime from "@/components/LocalTime";
import { useMedia } from "@/lib/use-media";

const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";

const TOUCH = () => "(hover: none)";

const dial = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export default function Offices({ offices }) {
  const uid = useId();
  const touch = useMedia(TOUCH);
  const [open, setOpen] = useState(null);

  return (

    <ol
      className="flex flex-1 flex-col justify-center [--shift:clamp(3.75rem,8.5vh,5rem)]"
      data-now
      data-shutter
    >
      {offices.map(({ city, address, phone, email, zone }) => {
        const id = `${uid}-${city}`;
        const shown = touch && open === city;

        return (
          <li className="ct__row" data-open={shown} key={city}>
            {/* Tetik yalnızca dokunmatikte basılıyor ve künyeden ÖNCE
                geliyor: açtığı içerik sekme sırasında ondan sonra gelsin.

                Koşullu olması güvenli — `false` da dizide bir yer tutuyor,
                yani aşağıdaki kutu her iki hâlde de aynı indekste kalıyor
                ve React onu yeniden oluşturmuyor. Oluştursaydı panjur
                animasyonunun yazdığı satır içi stiller silinirdi. */}
            {touch && (
              <button
                aria-controls={id}
                aria-expanded={shown}
                aria-label={`${city} — coordonnées`}
                className="ct__toggle"
                onClick={() => setOpen((prev) => (prev === city ? null : city))}
                type="button"
              />
            )}

            <div className="relative">

              <h2 className="ct__city">
                <span className="block" data-line>
                  {city}
                </span>

                <LocalTime

                  className={`${MICRO} absolute top-[0.08em] left-full ml-[0.5em] whitespace-nowrap text-bone/40 max-[600px]:hidden`}
                  zone={zone}
                />
              </h2>


              <dl
                className="ct__meta"
                id={id}
                inert={touch && !shown ? true : undefined}
              >
                <dt className="text-bone/30">P.</dt>
                <dd>
                  <a className="ct__sweep" href={dial(phone)}>
                    {phone}
                  </a>
                </dd>

                <dt className="text-bone/30">E.</dt>
                <dd>
                  <a className="ct__sweep" href={`mailto:${email}`}>
                    {email}
                  </a>
                </dd>

                <dt className="text-bone/30">A.</dt>
                <dd>
                  {address}, {city}
                </dd>
              </dl>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
