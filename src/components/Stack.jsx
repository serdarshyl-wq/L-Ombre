"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HOLD = 0.35;

export default function Stack({ children }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray("[data-panel]", root.current);
      if (panels.length < 2) return;

      const mm = gsap.matchMedia(root);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const stack = root.current;

        stack.dataset.pinned = "true";

        const inners = panels.map((panel) =>
          panel.querySelector("[data-panel-inner]")
        );

        gsap.set(panels.slice(1), { yPercent: 100 });

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: stack,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        panels.slice(1).forEach((panel, i) => {
          tl.to(inners[i], { yPercent: -12, opacity: 0.25 }, i);
          tl.to(panel, { yPercent: 0 }, i);
        });

        tl.to({}, { duration: HOLD });

        return () => {
          delete stack.dataset.pinned;
        };
      });
    },
    { scope: root }
  );

  return (
    <div className="stack" ref={root}>
      <div className="stack__frame">{children}</div>
    </div>
  );
}
