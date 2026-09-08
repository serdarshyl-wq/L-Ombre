"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const CLIENTS = [
  "SL",
  "Tom Ford",
  "BMW",
  "Cadillac",
  "Elixir",
  "Sony",
  "Nike",
  "Uber",
  "Dickies",
];

const BASE = 55;
const BOOST = 0.42;
const CAP = 1600;
const EASE = 0.16;


function Strip({ muted = false }) {
  return (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={muted || undefined}
      data-strip
    >
      {CLIENTS.map((name) => (
        <li className="flex items-center" key={name}>
          <span className="font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-none font-[350] tracking-[-0.015em] whitespace-nowrap uppercase">
            {name}
          </span>

          <span
            className="mx-[clamp(1.5rem,4vw,3.5rem)] block h-[clamp(4px,0.45vw,7px)] w-[clamp(4px,0.45vw,7px)] shrink-0 bg-current opacity-35"
            aria-hidden="true"
          />
        </li>
      ))}
    </ul>
  );
}

export default function Clientele() {
  const root = useRef(null);

  useGSAP(
    () => {
      const track = root.current.querySelector("[data-track]");
      const seed = [...track.children];

      const clone = seed[0].cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);

      let span = 0;
      const measure = () => {
        span = seed[0].offsetWidth;
      };
      measure();

      const mm = gsap.matchMedia(root);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let x = 0;
        let smooth = 0;
        let lastY = window.scrollY;
        let running = false;

        const tick = (time, delta) => {

          const y = window.scrollY;
          const vel = ((y - lastY) / Math.max(1, delta)) * 1000;
          lastY = y;
          smooth += (vel - smooth) * EASE;

          const push = BASE + gsap.utils.clamp(-CAP, CAP, smooth) * BOOST;
          x -= (push * delta) / 1000;
          x = (((x % span) + span) % span) - span;
          track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
        };

        const start = () => {
          if (running) return;
          running = true;
          lastY = window.scrollY;
          gsap.ticker.add(tick);
        };

        const stop = () => {
          if (!running) return;
          running = false;
          gsap.ticker.remove(tick);
        };

        const io = new IntersectionObserver(
          ([entry]) => (entry.isIntersecting ? start() : stop()),
          { rootMargin: "160px 0px" }
        );
        io.observe(track.parentElement);

        const ro = new ResizeObserver(measure);
        ro.observe(track);

        return () => {
          io.disconnect();
          ro.disconnect();
          stop();
        };
      });

      return () => clone.remove();
    },
    { scope: root }
  );

  return (
    <section
      aria-labelledby="cl-title"
      className="pt-[clamp(4rem,12vh,9rem)] pb-[clamp(6rem,16vh,12rem)]"
      ref={root}
    >
      <div className="mb-[clamp(2.5rem,7vh,5.5rem)] flex items-baseline justify-between gap-6 px-gutter">
        <h2
          className="text-[clamp(2rem,5vw,4.5rem)] leading-none font-[350] tracking-[0.02em] uppercase"
          id="cl-title"
          lang="fr"
        >
          La Clientèle
        </h2>
        <p className="text-[clamp(0.6875rem,0.9vw,0.8125rem)] tracking-[0.22em] whitespace-nowrap uppercase opacity-45">
          {String(CLIENTS.length).padStart(2, "0")} Clients
        </p>
      </div>

      <div className="relative overflow-clip border-y border-hairline py-[clamp(1.25rem,3.5vh,2.5rem)] mask-[linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        <div className="flex w-max will-change-transform" data-track>
          <Strip />
          <Strip muted />
        </div>
      </div>
    </section>
  );
}
