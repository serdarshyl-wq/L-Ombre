import Image from "next/image";
import { PortableText } from "@portabletext/react";

const BODY =
  "text-[clamp(0.9375rem,1.15vw,1.125rem)] leading-[1.8] text-bone/70 text-pretty";

const LINK =
  "relative inline-block text-bone " +
  "after:absolute after:inset-x-0 after:bottom-[-0.08em] after:h-px after:origin-right after:scale-x-100 after:bg-current after:content-[''] " +
  "after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.65,0,0.35,1)] " +
  "hover:after:origin-left hover:after:scale-x-0 " +
  "motion-reduce:after:transition-none";

function Figure({ value }) {
  if (!value?.url) return null;

  return (
    <figure className="my-[clamp(2rem,6vh,4rem)]">
      <Image
        alt={value.alt ?? ""}
        blurDataURL={value.lqip}
        className="h-auto w-full"
        height={value.height}
        placeholder={value.lqip ? "blur" : "empty"}
        sizes="(max-width: 900px) 100vw, 60vw"
        src={value.url}
        width={value.width}
      />
      {value.caption ? (
        <figcaption className="mt-[clamp(0.6rem,1.6vh,1rem)] text-[clamp(0.6875rem,0.85vw,0.8125rem)] leading-[1.6] text-bone/40">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

const components = {
  block: {
    normal: ({ children }) => (
      <p className={`${BODY} mt-[clamp(1rem,2.6vh,1.6rem)] first:mt-0`}>
        {children}
      </p>
    ),

    h2: ({ children }) => (
      <h2 className="mt-[clamp(2.75rem,8vh,5rem)] border-t border-hairline pt-[clamp(1.25rem,3vh,2rem)] font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.1] font-[350] tracking-[-0.02em] text-balance first:mt-0 first:border-t-0 first:pt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-[clamp(2rem,5vh,3rem)] font-display text-[clamp(1.125rem,2vw,1.625rem)] leading-[1.2] font-[350] text-balance">
        {children}
      </h3>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mt-[clamp(1rem,2.6vh,1.6rem)] space-y-[0.6em] pl-[1.2em]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-[clamp(1rem,2.6vh,1.6rem)] list-decimal space-y-[0.6em] pl-[1.2em]">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className={`${BODY} relative before:absolute before:left-[-1.2em] before:content-['—'] before:text-bone/30`}>
        {children}
      </li>
    ),
    number: ({ children }) => <li className={BODY}>{children}</li>,
  },

  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-bone">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        className={LINK}
        href={value?.href}
        rel={value?.blank ? "noreferrer noopener" : undefined}
        target={value?.blank ? "_blank" : undefined}
      >
        {children}
      </a>
    ),
  },

  types: {
    figure: Figure,
    image: Figure,
    pullQuote: ({ value }) =>
      value?.text ? (
        <blockquote className="my-[clamp(2.75rem,8vh,5rem)] border-y border-hairline py-[clamp(1.75rem,5vh,3rem)]">
          <p className="max-w-[24em] font-display text-[clamp(1.375rem,2.8vw,2.25rem)] leading-tight font-[350] tracking-[-0.015em] text-bone text-balance">
            {value.text}
          </p>
          {value.attribution ? (
            <cite className="mt-[clamp(0.75rem,2vh,1.25rem)] block text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] text-bone/40 uppercase not-italic">
              {value.attribution}
            </cite>
          ) : null}
        </blockquote>
      ) : null,
  },
};

export default function Prose({ value, className = "" }) {
  if (!value?.length) return null;

  return (
    <div className={className}>
      <PortableText components={components} value={value} />
    </div>
  );
}
