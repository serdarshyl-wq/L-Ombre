"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLenis } from "@/components/SmoothScroll";

const SELECTOR = 'a[href^="mailto:"], a[href^="tel:"]';

const UPWORK = "https://www.upwork.com/freelancers/~01d69f29e4f1440521";

/**
 * Kapanış geçişinin süresi. `transition-property: none` ise (hareket
 * azaltma) beklenecek bir şey yok — süre okunsaydı panel görünmez hâlde
 * yarım saniye daha modal kalırdı ve sayfa o kadar süre kilitli dururdu.
 */
const ms = (el) => {
  const cs = getComputedStyle(el);
  if (cs.transitionProperty === "none") return 0;
  return (parseFloat(cs.transitionDuration) || 0) * 1000;
};

export default function Colophon() {
  const ref = useRef(null);
  const lenis = useLenis();
  const uid = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.(SELECTOR);
      if (!link) return;
      event.preventDefault();
      setOpen(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open) {
      el.showModal();
      lenis?.stop();
      const frame = requestAnimationFrame(() => {
        el.dataset.shown = "true";
      });
      return () => cancelAnimationFrame(frame);
    }

    if (!el.open) return;

    el.dataset.shown = "false";
    lenis?.start();
    const timer = setTimeout(() => el.close(), ms(el));
    return () => clearTimeout(timer);
  }, [open, lenis]);

  return (
    <dialog
      aria-labelledby={uid}
      className="colophon"
      onCancel={(event) => {
        event.preventDefault();
        setOpen(false);
      }}
      onClick={(event) => {
        if (event.target === ref.current) setOpen(false);
      }}
      ref={ref}
    >
      <div className="colophon__panel">
        <p className="colophon__eyebrow" id={uid}>
          A note on this piece
        </p>

        <p className="colophon__lede">L’Ombre isn’t a real studio.</p>

        <p className="colophon__body">
          It’s a demonstration of custom design and engineering — the work is
          spec, and the brands shown belong to their owners.
        </p>

        <p className="colophon__body">
          If you’d like something built to this standard, end to end:
        </p>

        <p className="colophon__links">
          <a
            className="colophon__link"
            href="https://temnyy.dev/"
            rel="noreferrer"
            target="_blank"
          >
            temnyy.dev
          </a>
          <span aria-hidden="true">·</span>
          <a
            className="colophon__link"
            href={UPWORK}
            rel="noreferrer"
            target="_blank"
          >
            Upwork
          </a>
        </p>

        <button
          className="colophon__close"
          onClick={() => setOpen(false)}
          type="button"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
