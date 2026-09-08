"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ThresholdPlate from "@/components/ThresholdPlate";
import { shutterFor } from "@/lib/shutter";
import { setNavState } from "@/lib/nav-gate";
import { BEATS, NAV_PROGRESS } from "@/lib/intro";

const EASE = "power2.inOut";

export default function IntroStage() {
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

      const q = gsap.utils.selector(root);

      const frame = q(".stage__frame")[0];
      const curtainTop = q(".curtain--top")[0];
      const curtainBottom = q(".curtain--bottom")[0];
      const innerTop = q(".curtain--top .curtain__inner")[0];
      const innerBottom = q(".curtain--bottom .curtain__inner")[0];
      const marks = q("[data-wordmark]");

      const slogans = BEATS.slogans.map((_, i) => q(`[data-slogan="${i}"]`));

      const S = shutterFor(slogans[0][0]);
      const M = shutterFor(marks[0]);

      gsap.set(slogans.flat(), { y: `${S.shiftEm}em` });
      gsap.set(marks, { y: `${M.shiftEm}em` });

      const mm = gsap.matchMedia(root);

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.current, { height: "100svh" });
        gsap.set(frame, { position: "relative" });
        gsap.set([curtainTop, curtainBottom], { autoAlpha: 0 });
        gsap.set(slogans.flat(), S.shut);
        gsap.set(marks, M.open);

        setNavState({ open: true, solid: false });

        ScrollTrigger.create({
          trigger: root.current,
          start: "bottom top",
          end: "max",
          onToggle: ({ isActive }) =>
            setNavState({ open: true, solid: isActive }),
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {

        gsap.set(slogans[0], S.open);
        gsap.set([slogans[1], slogans[2]].flat(), S.shut);
        gsap.set(marks, M.shut);

        const tl = gsap.timeline({

          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        });

        const openTo = ({ to, at, duration, ease }) => {
          tl.to(curtainTop, { yPercent: -to, duration, ease }, at)
            .to(innerTop, { yPercent: to / 2, duration, ease }, at)
            .to(curtainBottom, { yPercent: to, duration, ease }, at)
            .to(innerBottom, { yPercent: -to / 2, duration, ease }, at);
        };

        openTo(BEATS.curtain);

        BEATS.slogans.forEach((beat, i) => {
          if (beat.in) {
            tl.to(
              slogans[i],
              { ...S.open, duration: beat.in[1] - beat.in[0], ease: EASE },
              beat.in[0]
            );
          }
          tl.to(
            slogans[i],
            { ...S.shut, duration: beat.out[1] - beat.out[0], ease: EASE },
            beat.out[0]
          );
        });

        tl.to(
          marks,
          { ...M.open, duration: BEATS.mark[1] - BEATS.mark[0], ease: EASE },
          BEATS.mark[0]
        );

        tl.to({}, { duration: BEATS.hold });

        const sync = ({ progress }) =>
          setNavState({
            open: progress >= NAV_PROGRESS,
            solid: progress >= 0.99,
          });

        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: sync,
          onRefresh: sync,
        });
      });
    },
    { scope: root, dependencies: [fontsReady] }
  );

  return (
    <section className="stage" ref={root} aria-labelledby="wordmark">
      <div className="stage__frame">
        <div className="threshold">
          <ThresholdPlate tone="bone" primary />

          <div className="curtain curtain--top">
            <div className="curtain__inner">
              <ThresholdPlate tone="obsidian" />
            </div>
          </div>

          <div className="curtain curtain--bottom">
            <div className="curtain__inner">
              <ThresholdPlate tone="obsidian" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
