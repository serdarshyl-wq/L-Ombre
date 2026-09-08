"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Roll from "@/components/Roll";
import { mountSoundFx } from "@/lib/fx-sound";
import { mountRenderFx } from "@/lib/fx-render";
import { mountFilmFx } from "@/lib/fx-film";
import { mountLayoutFx } from "@/lib/fx-layout";


const FX = {
  sound: mountSoundFx,
  render: mountRenderFx,
  film: mountFilmFx,
  layout: mountLayoutFx,
};


const DISCIPLINES = [
  { label: "Creative Direction", fx: "layout" },
  { label: "Cinematography", fx: "film" },
  {
    label: "CGI/VFX",
    fx: "render",
    frames: [
      "/videos/posters/wide/tom-ford.jpg",
      "/videos/posters/wide/ysl.jpg",
      "/videos/posters/wide/elixir.jpg",
    ],
  },
  { label: "Sound Design", fx: "sound" },
];

const IN = { duration: 0.55, ease: "power3.out" };
const OUT = { duration: 0.45, ease: "power2.inOut" };

const STUDIO_HREF = "/studio";

const MOTION =
  "transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none";


function Cell({ index, label, fx, frames }) {
  return (
    <div className="flex items-center gap-[clamp(1.25rem,4vw,4rem)] px-gutter">
      <span className="mt-[clamp(1.25rem,3.5vh,2.5rem)] flex-none self-start text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] opacity-45">
        {index}
      </span>

      <span className="font-display text-[clamp(2rem,7vw,6.5rem)] font-[350] leading-[0.95] tracking-[-0.02em] uppercase">
        {label}
      </span>


      {fx ? (
        <span
          className="relative min-w-0 flex-1 self-stretch overflow-clip"
          data-fx={fx}
          data-frames={frames?.join(",")}
        />
      ) : null}
    </div>
  );
}

function Row({ index, label, fx, frames }) {
  return (
    <li
      className="relative grid min-h-[clamp(5.5rem,15svh,11rem)] overflow-clip border-b border-hairline"
      data-row
    >
      <Cell index={index} label={label} />


      <div
        className="absolute inset-0 overflow-clip transform-[translateY(-100%)] will-change-transform"
        data-panel
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 grid bg-bone text-obsidian transform-[translateY(100%)] will-change-transform"
          data-inner
        >
          <Cell index={index} label={label} fx={fx} frames={frames} />
        </div>
      </div>
    </li>
  );
}

function StudioCta() {
  const arrow = `absolute inset-0 h-full w-full ${MOTION}`;

  return (
    <Link
      className="group inline-flex items-center gap-[clamp(0.75rem,1.6vw,1.5rem)] font-display text-[clamp(1.375rem,3.2vw,3rem)] font-[350] tracking-[0.01em] text-bone uppercase"
      href={STUDIO_HREF}
      lang="fr"
    >

      <Roll label="Découvrez le Studio" tall />

      <span
        className="relative block h-[0.62em] w-[0.62em] flex-none overflow-clip"
        aria-hidden="true"
      >
        <ArrowUpRight
          className={`${arrow} group-hover:translate-x-full group-hover:-translate-y-full`}
          strokeWidth={1}
        />
        <ArrowUpRight
          className={`${arrow} -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0`}
          strokeWidth={1}
        />
      </span>
    </Link>
  );
}

export default function Expertise() {
  const root = useRef(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray("[data-row]", root.current);

      const layers = rows.map((row) => {
        const panel = row.querySelector("[data-panel]");
        const inner = row.querySelector("[data-inner]");
        gsap.set(panel, { y: 0, yPercent: -100 });
        gsap.set(inner, { y: 0, yPercent: 100 });
        return { row, panel, inner, host: row.querySelector("[data-fx]") };
      });

      const NONE = { enter() { }, move() { }, leave() { }, destroy() { } };
      const mountFx = (host, still) =>
        host ? FX[host.dataset.fx](host, { still }) : NONE;

      const edge = (row, e) => {
        const { top, height } = row.getBoundingClientRect();
        return e.clientY < top + height / 2 ? -1 : 1;
      };

      const mm = gsap.matchMedia(root);

      mm.add("(prefers-reduced-motion: reduce) and (hover: hover)", () => {
        const off = layers.map(({ row, panel, inner, host }) => {
          const fx = mountFx(host, true);
          const show = (on) => {
            gsap.set(panel, { yPercent: on ? 0 : -100 });
            gsap.set(inner, { yPercent: on ? 0 : 100 });
          };
          const enter = () => show(true);
          const leave = () => show(false);

          row.addEventListener("pointerenter", enter);
          row.addEventListener("pointerleave", leave);
          return () => {
            row.removeEventListener("pointerenter", enter);
            row.removeEventListener("pointerleave", leave);
            fx.destroy();
          };
        });

        return () => off.forEach((fn) => fn());
      });

      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover)", () => {
        const off = layers.map(({ row, panel, inner, host }) => {
          const fx = mountFx(host, false);

          const enter = (e) => {
            const dir = edge(row, e);
            const out = Math.abs(gsap.getProperty(panel, "yPercent")) >= 99.5;

            gsap.killTweensOf([panel, inner]);


            if (out) {
              gsap.set(panel, { yPercent: 100 * dir });
              gsap.set(inner, { yPercent: -100 * dir });
            }

            gsap.to(panel, { yPercent: 0, ...IN });
            gsap.to(inner, { yPercent: 0, ...IN });
            fx.enter(e);
          };

          const move = (e) => fx.move(e);

          const leave = (e) => {
            const dir = edge(row, e);
            gsap.killTweensOf([panel, inner]);
            gsap.to(panel, { yPercent: 100 * dir, ...OUT });
            gsap.to(inner, { yPercent: -100 * dir, ...OUT });
            fx.leave();
          };

          row.addEventListener("pointerenter", enter);
          row.addEventListener("pointerleave", leave);

          if (host) row.addEventListener("pointermove", move);

          return () => {
            row.removeEventListener("pointerenter", enter);
            row.removeEventListener("pointerleave", leave);
            row.removeEventListener("pointermove", move);
            fx.destroy();
          };
        });

        return () => off.forEach((fn) => fn());
      });
    },
    { scope: root }
  );

  return (
    <section
      className="pt-[clamp(6rem,16vh,12rem)]"
      ref={root}
      aria-labelledby="xp-title"
    >
      <div className="mb-[clamp(2.5rem,7vh,5.5rem)] flex items-baseline justify-between gap-6 px-gutter">
        <h2
          className="text-[clamp(2rem,5vw,4.5rem)] font-[350] leading-none tracking-[0.02em] uppercase"
          id="xp-title"
        >
          Expertise
        </h2>
        <p className="text-[clamp(0.6875rem,0.9vw,0.8125rem)] tracking-[0.22em] whitespace-nowrap uppercase opacity-45">
          {String(DISCIPLINES.length).padStart(2, "0")} Disciplines
        </p>
      </div>

      <ul className="border-t border-hairline">
        {DISCIPLINES.map(({ label, fx, frames }, i) => (
          <Row
            key={label}
            index={String(i + 1).padStart(2, "0")}
            label={label}
            fx={fx}
            frames={frames}
          />
        ))}
      </ul>


      <div className="flex justify-center px-gutter py-[clamp(5rem,14vh,9rem)]">
        <StudioCta />
      </div>
    </section>
  );
}
