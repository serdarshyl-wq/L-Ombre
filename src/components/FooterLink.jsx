"use client";

import Link from "next/link";


const SWEEP =
  "relative inline-block opacity-70 transition-opacity duration-300 ease-[ease] hover:opacity-100 focus-visible:opacity-100 " +
  "after:absolute after:inset-x-0 after:bottom-[-0.18em] after:h-px after:origin-right after:scale-x-0 after:bg-current after:content-[''] " +
  "after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.65,0,0.35,1)] " +
  "hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100 " +
  "motion-reduce:after:transition-none";

export default function FooterLink({ href = "#", className = "", children }) {
  const style = `${SWEEP} ${className}`;

  if (href.startsWith("/")) {
    return (
      <Link className={style} href={href}>
        {children}
      </Link>
    );
  }

  const blank = href.startsWith("http");

  return (
    <a
      className={style}
      href={href}
      onClick={(e) => {
        if (href === "#") e.preventDefault();
      }}
      rel={blank ? "noreferrer" : undefined}
      target={blank ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}
