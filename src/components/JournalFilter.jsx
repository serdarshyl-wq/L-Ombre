"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Flip);

const FILTERS = [
  { id: "all", label: "All" },
  { id: "case-study", label: "Case Study" },
  { id: "culture", label: "Culture & Vision" },
];

const DURATION = 0.75;
const EASE = "power3.inOut";

const FLIP = {
  duration: DURATION,
  ease: EASE,
  absolute: true,
  scale: false,
  onEnter: (els) =>
    gsap.fromTo(
      els,
      { opacity: 0 },
      { opacity: 1, duration: 0.45, delay: 0.2, ease: "power2.out" }
    ),
  onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3, ease: "power2.in" }),
};

export default function JournalFilter({ counts, children }) {
  const root = useRef(null);
  const [active, setActive] = useState("all");

  const apply = (next, animate = true) => {
    if (next === active) return;
    setActive(next);

    const grid = root.current.querySelector("[data-grid]");
    const cards = gsap.utils.toArray("[data-kind]", root.current);
    if (!grid || !cards.length) return;

    const still =
      !animate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const before = grid.getBoundingClientRect().height;
    const state = still ? null : Flip.getState(cards);

    const shown = [];
    cards.forEach((card) => {
      const on = next === "all" || card.dataset.kind === next;
      card.style.display = on ? "" : "none";
      if (on) shown.push(card);
      delete card.dataset.lead;
    });

    if (shown[0]) shown[0].dataset.lead = "true";

    if (!state) return;

    const after = grid.getBoundingClientRect().height;

    gsap.set(grid, { overflow: "clip" });
    gsap.fromTo(
      grid,
      { height: before },
      {
        height: after,
        duration: DURATION,
        ease: EASE,

        onComplete: () => gsap.set(grid, { clearProps: "height,overflow" }),
      }
    );

    Flip.from(state, FLIP);
  };

  useGSAP(() => {
    const wanted = new URLSearchParams(window.location.search).get("filter");
    if (wanted && wanted !== "all" && FILTERS.some(({ id }) => id === wanted)) {
      apply(wanted, false);
    }
  });

  const empty = active !== "all" && counts[active] === 0;

  return (
    <div ref={root}>
      <div
        aria-label="Filter journal"
        className="flex flex-wrap items-baseline gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-3 border-y border-hairline px-gutter py-[clamp(0.9rem,2.2vh,1.4rem)]"
        role="group"
      >
        {FILTERS.map(({ id, label }) => (
          <button
            aria-pressed={active === id}
            className="group relative pb-[0.35em] text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] whitespace-nowrap text-bone/45 uppercase transition-colors duration-300 ease-[ease] hover:text-bone data-[on=true]:text-bone motion-reduce:transition-none"
            data-on={active === id}
            key={id}
            onClick={() => apply(id)}
            type="button"
          >
            {label}

            <sup className="ml-[0.6em] align-super text-[0.7em] tracking-normal text-bone/40">
              {counts[id]}
            </sup>

            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:origin-left group-hover:scale-x-100 group-data-[on=true]:origin-left group-data-[on=true]:scale-x-100 motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>

      {children}

      {empty ? (
        <p className="px-gutter py-[clamp(4rem,14vh,9rem)] text-center text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.75] text-bone/45">
          Nothing here yet. The first one is being written.
        </p>
      ) : null}
    </div>
  );
}
