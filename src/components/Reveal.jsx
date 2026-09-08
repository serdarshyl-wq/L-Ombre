"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { shutterFor } from "@/lib/shutter";

const RISE = () => ({ opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
const SLIDE = () => ({ x: 0, opacity: 1, duration: 1.25, ease: "power3.out" });
const LIFT = { duration: 1.05, ease: "power4.out", stagger: 0.075 };
const SHUTTER = { duration: 1.05, ease: "power2.inOut" };
const SHUTTER_STEP = 0.11;

const WIPE = {
  clipPath: "inset(0% 0% 0% 0%)",
  x: 0,
  duration: 1.25,
  ease: "power3.out",
};

const CURTAIN = { yPercent: 0, duration: 1.15, ease: "power3.inOut" };
const MARGIN = "0px 0px -12% 0px";

export default function Reveal({ children, className = "" }) {
  const root = useRef(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) setFontsReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useGSAP(
    () => {
      if (!fontsReady) return;

      const mm = gsap.matchMedia(root);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = (selector) => gsap.utils.toArray(selector, root.current);
        const lines = (el) => gsap.utils.toArray("[data-line]", el);
        const plays = new Map();

        q("[data-rise]").forEach((el) => {
          plays.set(el, () => gsap.fromTo(el, { opacity: 0, y: 26 }, RISE()));
        });

        q("[data-in]").forEach((el) => {
          plays.set(el, () => {
            const box = el.getBoundingClientRect();
            const yon = el.dataset.in;
            const peer = el.previousElementSibling ?? el.nextElementSibling;
            const from =
              yon === "peer" && peer
                ? peer.getBoundingClientRect().left - box.left
                : yon === "right"
                  ? window.innerWidth - box.left + 32
                  : -(box.right + 32);

            return gsap.fromTo(el, { x: from, opacity: 1 }, SLIDE());
          });
        });

        q("[data-mask]").forEach((el) => {
          const parts = lines(el);
          const left = el.dataset.mask === "left";

          plays.set(el, () =>
            left
              ? gsap.fromTo(
                parts,
                { xPercent: -105, x: 0 },
                { xPercent: 0, ...LIFT }
              )
              : gsap.fromTo(
                parts,
                { yPercent: 110, y: 0 },
                { yPercent: 0, ...LIFT }
              )
          );
        });

        q("[data-shutter]").forEach((el) => {
          const parts = lines(el).map((line) => ({
            line,
            shutter: shutterFor(line),
          }));

          parts.forEach(({ line, shutter }) => {
            gsap.set(line, { y: `${shutter.shiftEm}em` });
          });

          plays.set(el, () => {
            const tl = gsap.timeline();
            parts.forEach(({ line, shutter }, i) => {
              tl.fromTo(
                line,
                shutter.shut,
                { ...shutter.open, ...SHUTTER },
                i * SHUTTER_STEP
              );
            });
            return tl;
          });
        });

        q("[data-wipe]").forEach((el) => {
          plays.set(el, () =>
            gsap.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)", x: -24 }, {
              ...WIPE,

              onComplete: () => gsap.set(el, { clipPath: "none" }),
            })
          );
        });

        q("[data-curtain]").forEach((el) => {
          const sheet = el.querySelector("[data-sheet]");
          const still = el.querySelector("[data-still]");
          if (!sheet) return;

          plays.set(el, () => {
            const tl = gsap.timeline();
            tl.fromTo(sheet, { yPercent: -100, y: 0 }, { ...CURTAIN }, 0);
            if (still) {
              tl.fromTo(still, { yPercent: 100, y: 0 }, { ...CURTAIN }, 0);
            }
            return tl;
          });
        });

        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              io.unobserve(entry.target);
              plays.get(entry.target)?.();
            });
          },
          { rootMargin: MARGIN }
        );

        plays.forEach((play, el) => {
          if (el.hasAttribute("data-now")) play();
          else io.observe(el);
        });

        return () => io.disconnect();
      });
    },
    { scope: root, dependencies: [fontsReady] }
  );

  return (
    <div className={className} ref={root}>
      {children}
    </div>
  );
}
