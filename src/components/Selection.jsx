"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ProjectCard from "@/components/ProjectCard";
import { shutterFor } from "@/lib/shutter";
import { useLenis } from "@/components/SmoothScroll";
import { beginMorph } from "@/lib/page-transition";
import projects from "@/data/projects.json";

const FEATURED = projects.filter((project) => project.featured);
const EASE = "power2.inOut";
const RISE = 0.35;

export default function Selection() {
  const root = useRef(null);
  const router = useRouter();
  const lenis = useLenis();

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

      const q = gsap.utils.selector(root);
      const frame = q(".selection__frame")[0];
      const track = q(".selection__track")[0];
      const cards = q("[data-card]");

      const mm = gsap.matchMedia(root);

      const parts = (card) => ({
        video: card.querySelector("[data-video]"),
        reveals: Array.from(card.querySelectorAll("[data-reveal]")),
      });

      const play = (video) => void video?.play()?.catch?.(() => { });

      const on = (card, enter, leave) => {
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        return () => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
        };
      };

      const bindNavigate = (card) => {
        const link = card.querySelector("a[href]");
        const frame = card.querySelector(".card__frame");
        const video = card.querySelector("[data-video]");
        if (!link || !frame) return () => { };

        const onClick = (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
            return;

          e.preventDefault();
          video?.pause();
          lenis?.beginNav();

          const href = link.getAttribute("href");

          beginMorph({
            slug: href.split("/").pop(),
            rect: frame.getBoundingClientRect(),
            image: card.dataset.wide,

            onCovered: () => router.push(href),
          });
        };

        link.addEventListener("click", onClick);
        return () => link.removeEventListener("click", onClick);
      };

      const bindAll = (bindOne) => {
        const unbinders = cards.flatMap((card) => [
          bindOne(card),
          bindNavigate(card),
        ]);
        return () => unbinders.forEach((fn) => fn());
      };

      const bindMotion = (card) => {
        const { video, reveals } = parts(card);
        const tl = gsap.timeline({ paused: true });

        tl.to(
          video,
          { filter: "grayscale(0)", scale: 1.03, duration: 0.7, ease: "power2.out" },
          0
        );

        reveals.forEach((el, i) => {
          const { shiftEm, shut, open } = shutterFor(el);
          gsap.set(el, { ...shut, y: `${shiftEm + RISE}em` });

          tl.to(
            el,
            { ...open, y: `${shiftEm}em`, duration: 0.55, ease: EASE },
            i * 0.07
          );
        });

        return on(
          card,
          () => {
            tl.play();
            play(video);
          },
          () => {
            tl.reverse();
            video?.pause();
          }
        );
      };

      const bindStatic = (card) => {
        const { video, reveals } = parts(card);

        reveals.forEach((el) => {
          const { shiftEm, open } = shutterFor(el);
          gsap.set(el, { ...open, y: `${shiftEm}em` });
        });

        return on(
          card,
          () => {
            gsap.set(video, { filter: "grayscale(0)" });
            play(video);
          },
          () => {
            gsap.set(video, { filter: "grayscale(1)" });
            video?.pause();
          }
        );
      };

      const bindOpen = (card) => {
        const { video, reveals } = parts(card);

        reveals.forEach((el) => {
          const { shiftEm, open } = shutterFor(el);
          gsap.set(el, { ...open, y: `${shiftEm}em` });
        });

        gsap.set(video, { filter: "grayscale(0)" });
        return () => { };
      };

      const scrub = (catchUp) => {
        const applyLayout = () => {
          const distance = Math.max(0, track.scrollWidth - frame.clientWidth);
          root.current.style.height = `${window.innerHeight + distance}px`;
          return distance;
        };

        let distance = applyLayout();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: catchUp,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              distance = applyLayout();
            },

            onToggle: ({ isActive }) => {
              if (!isActive) return;
              cards.forEach((card) => {
                const video = card.querySelector("[data-video]");
                if (video && video.preload !== "auto") {
                  video.preload = "auto";
                  video.load();
                }
              });
            },
          },
        });

        tl.to(track, { x: () => -distance, ease: "none", duration: 1 });

        return () => {
          if (root.current) root.current.style.height = "";
        };
      };

      const swipe = () => {
        const LOCK = 6;
        const FLICK = 0.25;
        const WINDOW = 120;
        const clamp = (y) =>
          gsap.utils.clamp(
            0,
            Math.max(
              0,
              document.documentElement.scrollHeight - window.innerHeight
            ),
            y
          );

        let axis = null;
        let startX = 0;
        let startY = 0;
        let originY = 0;
        let dragged = false;
        let samples = [];

        const onStart = (e) => {
          if (e.touches.length !== 1) {
            axis = "y";
            return;
          }

          axis = null;
          dragged = false;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          originY = window.scrollY;
          samples = [{ t: e.timeStamp, y: originY }];
        };

        const onMove = (e) => {
          if (axis === "y" || e.touches.length !== 1) return;

          const dx = e.touches[0].clientX - startX;
          const dy = e.touches[0].clientY - startY;

          if (!axis) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK) return;
            axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            if (axis === "y") return;
          }

          e.preventDefault();
          dragged = true;

          const y = clamp(originY - dx);
          lenis?.setY(y);

          samples.push({ t: e.timeStamp, y });
          while (samples.length > 2 && e.timeStamp - samples[0].t > WINDOW)
            samples.shift();
        };

        const onEnd = (e) => {
          if (axis !== "x") return;
          axis = null;

          const last = samples.at(-1);
          const first = samples[0];
          if (!last || last === first) return;

          if (e.timeStamp - last.t > 100) return;

          const v = (last.y - first.y) / (last.t - first.t);
          if (Math.abs(v) < FLICK) return;

          const glide = gsap.utils.clamp(-1400, 1400, v * 260);
          lenis?.glideTo(
            clamp(last.y + glide),
            gsap.utils.clamp(0.4, 1.1, Math.abs(glide) / 1200)
          );
        };

        const onClick = (e) => {
          if (!dragged) return;
          dragged = false;
          e.preventDefault();
          e.stopPropagation();
        };

        frame.addEventListener("touchstart", onStart, { passive: true });
        frame.addEventListener("touchmove", onMove, { passive: false });
        frame.addEventListener("touchend", onEnd, { passive: true });
        frame.addEventListener("touchcancel", onEnd, { passive: true });
        frame.addEventListener("click", onClick, true);

        return () => {
          frame.removeEventListener("touchstart", onStart);
          frame.removeEventListener("touchmove", onMove);
          frame.removeEventListener("touchend", onEnd);
          frame.removeEventListener("touchcancel", onEnd);
          frame.removeEventListener("click", onClick, true);
        };
      };

      mm.add("(prefers-reduced-motion: reduce)", () => bindAll(bindStatic));

      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover)", () => {
        const unbind = bindAll(bindMotion);
        const stop = scrub(1);
        return () => {
          unbind();
          stop();
        };
      });

      mm.add("(prefers-reduced-motion: no-preference) and (hover: none)", () => {
        const unbind = bindAll(bindOpen);
        const stop = scrub(0.35);
        const unswipe = swipe();
        return () => {
          unbind();
          stop();
          unswipe();
        };
      });

    },
    { scope: root, dependencies: [fontsReady] }
  );

  return (
    <section className="selection" ref={root} aria-labelledby="selection-title">
      <div className="selection__frame">
        <div className="selection__head">
          <h2 className="selection__title" id="selection-title" lang="fr">
            SÉLECTION
          </h2>
          <p className="selection__count">
            {String(FEATURED.length).padStart(2, "0")} Projets
          </p>
        </div>

        <div className="selection__track">
          {FEATURED.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
