"use client";

import { useId, useState } from "react";
import { useMedia } from "@/lib/use-media";

// Eşik `@theme` içinde yazılı; buraya ikinci bir 1280 yazmak ikisinin ayrı
// düşmesi demek. Bir kez okunup saklanıyor — `getComputedStyle` her
// render'da çalışmasın.
let query = null;

const COMPACT = () => {
  if (!query) {
    const px = getComputedStyle(document.documentElement)
      .getPropertyValue("--breakpoint-tablet")
      .trim();
    query = `(width < ${px || "1280px"})`;
  }
  return query;
};


export default function FooterCategory({ title, className = "", children }) {
  const id = useId();
  const compact = useMedia(COMPACT);
  const [open, setOpen] = useState(false);
  const shown = compact ? open : true;

  const label = (
    <>
      {title}
      <span className="foot__sign" aria-hidden="true" />
    </>
  );

  return (
    <div className="foot__cat" data-open={shown && compact}>
      {compact ? (
        <button
          aria-controls={id}
          aria-expanded={open}
          className="foot__head"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          {label}
        </button>
      ) : (
        <p className="foot__head">{label}</p>
      )}


      <div className="foot__panel" id={id} inert={!shown ? true : undefined}>
        <div className="foot__panel-inner">
          <ul className={`foot__list ${className}`}>{children}</ul>
        </div>
      </div>
    </div>
  );
}
