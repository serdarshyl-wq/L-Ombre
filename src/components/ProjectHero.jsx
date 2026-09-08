"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import VideoControls from "@/components/VideoControls";
import ProjectDetails from "@/components/ProjectDetails";
import { shutterFor } from "@/lib/shutter";
import { morphPending, completeMorph } from "@/lib/page-transition";
import { setNavState } from "@/lib/nav-gate";

const EASE = "power2.inOut";
const RISE = 0.35;

export default function ProjectHero({ project }) {
  const root = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
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

  useEffect(() => {
    setNavState({ open: false, solid: false });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  useGSAP(
    () => {
      if (!fontsReady) return;

      const q = gsap.utils.selector(root);
      const stage = q(".pj__stage")[0];
      const rail = q(".pj__rail")[0];
      const reel = q(".pj__reel")[0];
      const aside = q(".pj__aside")[0];
      const reveals = q("[data-reveal]");
      const controls = q(".controls")[0];

      const settle = () => {

        videoRef.current?.play()?.catch?.(() => { });
        setNavState({ open: true, solid: false });
      };

      const applyLayout = () => {
        const distance = Math.max(0, reel.scrollHeight - rail.clientHeight);
        root.current.style.height = `${window.innerHeight + distance}px`;
        return distance;
      };

      let distance = applyLayout();

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            distance = applyLayout();
          },
        },
      });

      scrollTl.to(reel, { y: () => -distance, ease: "none", duration: 1 });

      const armText = () =>
        reveals.map((el) => {
          const { shiftEm, shut, open } = shutterFor(el);
          gsap.set(el, { ...shut, y: `${shiftEm + RISE}em` });
          return { el, open, y: `${shiftEm}em` };
        });

      const mm = gsap.matchMedia(root);

      mm.add("(prefers-reduced-motion: reduce)", () => {
        reveals.forEach((el) => {
          const { shiftEm, open } = shutterFor(el);
          gsap.set(el, { ...open, y: `${shiftEm}em` });
        });
        gsap.set([controls, aside, stage], { autoAlpha: 1 });
        settle();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const armed = armText();
        gsap.set([controls, aside], { autoAlpha: 0 });

        const revealText = (tl, at) => {
          armed.forEach(({ el, open, y }, i) => {
            tl.to(el, { ...open, y, duration: 0.6, ease: EASE }, at + i * 0.07);
          });
          tl.to(aside, { autoAlpha: 1, duration: 0.5 }, at);
          tl.to(controls, { autoAlpha: 1, duration: 0.5 }, at + 0.35);
        };

        if (morphPending(project.slug)) {
          gsap.set(stage, { autoAlpha: 0 });

          requestAnimationFrame(() => {
            completeMorph(stage.getBoundingClientRect(), () => {
              gsap.set(stage, { autoAlpha: 1 });
              const tl = gsap.timeline({ onComplete: settle });
              revealText(tl, 0);
            });
          });
          return;
        }

        gsap.set(stage, { autoAlpha: 1 });
        const narrow = () => {
          const w = stage.offsetWidth || 1;
          const inset = ((1 - (stage.offsetHeight * (9 / 16)) / w) / 2) * 100;
          return `inset(0% ${Math.max(0, inset)}% 0% ${Math.max(0, inset)}%)`;
        };

        const tl = gsap.timeline({ onComplete: settle });
        tl.fromTo(
          stage,
          { clipPath: narrow() },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1,
            ease: "power3.inOut",
          },
          0
        );
        revealText(tl, 0.35);
      });
    },
    { scope: root, dependencies: [fontsReady] }
  );

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play()?.catch?.(() => { });
    else video.pause();
  };

  const { id, brand, campaign, category, year, client, format, summary } =
    project;

  return (
    <section className="pj" ref={root} aria-labelledby="pj-title">
      <div className="pj__frame">
        <div className="pj__grid">
          <div className="pj__film">
            <div className="pj__stage">
              <video
                ref={videoRef}
                className="pj__video"
                src={project.fullSrc}
                poster={project.wide}
                loop
                muted
                playsInline
                preload="auto"
              />
              <VideoControls
                videoRef={videoRef}
                playing={playing}
                onToggle={toggle}
              />
            </div>
          </div>

          <div className="pj__rail">
            <div className="pj__reel">
              <div className="pj__aside">
                <p className="pj__id">{id}</p>

                <h1 className="pj__title" id="pj-title">
                  <span data-reveal>{brand}</span>
                </h1>

                <p className="pj__campaign" lang="fr">
                  <span data-reveal>{campaign}</span>
                </p>

                <p className="pj__category">
                  <span data-reveal>{category}</span>
                </p>

                <p className="pj__summary">{summary}</p>

                <dl className="pj__facts">
                  <div>
                    <dt>Client</dt>
                    <dd>{client}</dd>
                  </div>
                  <div>
                    <dt>Year</dt>
                    <dd>{year}</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>{format}</dd>
                  </div>
                </dl>
              </div>

              <ProjectDetails project={project} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
