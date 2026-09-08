"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { heroScrollY } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

function createController() {
  let instance = null;
  let locked = false;
  let restoreNext = false;
  let navigating = false;

  return {
    beginNav() {
      navigating = true;
    },
    endNav() {
      navigating = false;
    },
    canSave() {
      return !navigating;
    },
    markRestore() {
      restoreNext = true;
    },
    takeRestore() {
      const value = restoreNext;
      restoreNext = false;
      return value;
    },
    attach(next) {
      instance = next;
      if (locked) next.stop();
    },
    detach() {
      instance = null;
    },
    stop() {
      locked = true;
      instance?.stop();
    },
    start() {
      locked = false;
      instance?.start();
    },
    to(target, options) {
      if (!instance) {
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      instance.scrollTo(target, { duration: 1.4, ...options });
    },
    setY(y) {
      if (!instance) {
        window.scrollTo(0, y);
        return;
      }
      instance.scrollTo(y, { immediate: true });
    },
    glideTo(y, duration) {
      if (!instance) {
        window.scrollTo(0, y);
        return;
      }
      instance.scrollTo(y, {
        duration,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    },
    jumpTo(y) {
      if (!instance) {
        window.scrollTo(0, y);
        return;
      }
      instance.resize();
      instance.scrollTo(y, { immediate: true, force: true });
    },
  };
}

const maxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

export default function SmoothScroll({ children }) {
  const [controller] = useState(createController);
  const pathname = usePathname();
  const positions = useRef(new Map());
  const currentPath = useRef(pathname);
  const restoring = useRef(false);
  const landed = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const onPop = () => {
      controller.beginNav();
      controller.markRestore();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [controller]);

  useEffect(() => {
    currentPath.current = pathname;
    const restore = controller.takeRestore();
    const first = !landed.current;
    landed.current = true;

    const target = restore
      ? (positions.current.get(pathname) ?? 0)
      : !first && pathname === "/"
        ? heroScrollY()
        : 0;

    if (target === 0) {
      ScrollTrigger.refresh();
      controller.jumpTo(0);
      controller.endNav();
      return;
    }

    restoring.current = true;

    let raf = 0;
    let done = false;
    const startedAt = performance.now();

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      restoring.current = false;
      controller.endNav();
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };

    function release() {
      finish();
    }

    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", release);

    const tick = () => {
      if (done) return;

      const reached = maxScroll() >= target;
      controller.jumpTo(Math.min(target, maxScroll()));

      if (!reached && performance.now() - startedAt < 2000) {
        raf = requestAnimationFrame(tick);
        return;
      }

      ScrollTrigger.refresh();
      controller.jumpTo(Math.min(target, maxScroll()));
      finish();
    };

    tick();
    return finish;
  }, [pathname, controller]);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const onScroll = () => {
      if (!restoring.current && controller.canSave()) {
        positions.current.set(currentPath.current, window.scrollY);
      }
      ScrollTrigger.update();
    };

    instance.on("scroll", onScroll);

    const raf = (time) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    controller.attach(instance);

    return () => {
      instance.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      instance.destroy();
      controller.detach();
    };
  }, [controller]);

  return (
    <LenisContext.Provider value={controller}>{children}</LenisContext.Provider>
  );
}
