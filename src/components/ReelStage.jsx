"use client";

import { useEffect, useRef } from "react";

const VISIBLE = 0.4;

const WARM = "300px 0px";

export default function ReelStage({ children, className = "" }) {
  const root = useRef(null);

  useEffect(() => {
    const reels = [...root.current.querySelectorAll("video[data-reel]")];
    if (!reels.length) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");

    const warm = (video) => {
      if (video.preload === "auto") return;
      video.preload = "auto";
      video.load();
    };

    const play = (video) => void video.play()?.catch?.(() => { });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
          if (isIntersecting) warm(target);

          if (isIntersecting && intersectionRatio >= VISIBLE && motion.matches) {
            play(target);
          } else {
            target.pause();
          }
        });
      },
      { rootMargin: WARM, threshold: [0, VISIBLE] }
    );

    reels.forEach((reel) => io.observe(reel));

    const onMotion = () => {
      if (!motion.matches) reels.forEach((reel) => reel.pause());
    };
    motion.addEventListener("change", onMotion);

    return () => {
      io.disconnect();
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div className={className} ref={root}>
      {children}
    </div>
  );
}
