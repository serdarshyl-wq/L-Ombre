import Image from "next/image";
import Prose from "@/components/Prose";


const MICRO =
  "text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase";

const DAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});


const COLUMNS =
  "[&>*]:col-start-1 [&>figure]:col-span-2 [&>blockquote]:col-span-2 " +
  "min-[900px]:grid min-[900px]:grid-cols-[min(62ch,100%)_minmax(0,1fr)] " +
  "min-[900px]:gap-x-[clamp(1.5rem,4vw,4rem)]";


const LEDE =
  "[&>p:first-of-type]:text-[clamp(1.0625rem,1.45vw,1.375rem)] " +
  "[&>p:first-of-type]:leading-[1.65] " +
  "[&>p:first-of-type]:text-bone/85 " +
  "[&>p:first-of-type]:mb-[clamp(0.5rem,1.5vh,1rem)]";

function minutesToRead(blocks) {
  const words =
    blocks?.reduce((total, block) => {
      if (block._type !== "block") return total;
      const text = block.children?.map((span) => span.text ?? "").join(" ") ?? "";
      return total + text.trim().split(/\s+/).filter(Boolean).length;
    }, 0) ?? 0;

  return Math.max(1, Math.ceil(words / 200));
}

function RailItem({ term, children }) {
  if (!children) return null;

  return (
    <div className="mt-[clamp(0.9rem,2.4vh,1.4rem)] first:mt-0">
      <dt className={`${MICRO} text-bone/30`}>{term}</dt>
      <dd className={`${MICRO} mt-[0.5em] text-bone/60`}>{children}</dd>
    </div>
  );
}

export default function ArticleView({ entry }) {
  const { title, excerpt, kicker, cover, body, byline, publishedAt } = entry;
  const minutes = minutesToRead(body);

  return (
    <article>

      <header className="px-gutter pt-[clamp(2.5rem,8vh,5rem)]">
        <p className={`${MICRO} text-bone/40`}>{kicker}</p>

        <h1
          className="mt-[clamp(1.25rem,3.5vh,2.25rem)] max-w-[15ch] font-display text-[clamp(2.5rem,8vw,7rem)] leading-[0.94] font-[350] tracking-[-0.035em] text-balance"
          data-now
          data-shutter
        >
          <span className="block" data-line>
            {title}
          </span>
        </h1>


        <div className="mt-[clamp(1.75rem,4.5vh,3rem)] overflow-clip" data-mask data-now>
          <p
            className="max-w-[22em] font-display text-[clamp(1.25rem,2.4vw,2rem)] leading-[1.3] font-[350] tracking-[-0.015em] text-bone/70 text-balance"
            data-line
          >
            {excerpt}
          </p>
        </div>
      </header>

      {cover?.url ? (
        <div className="mt-[clamp(2.5rem,8vh,5rem)] overflow-clip" data-curtain>
          <div data-sheet>
            <div className="relative aspect-video" data-still>
              <Image
                alt={cover.alt ?? title}
                blurDataURL={cover.lqip}
                className="object-cover"
                fill
                placeholder={cover.lqip ? "blur" : "empty"}
                priority
                sizes="100vw"
                src={cover.url}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-x-[clamp(1.5rem,4vw,4.5rem)] gap-y-[clamp(2rem,5vh,3rem)] px-gutter py-[clamp(3rem,10vh,7rem)]">
        <aside className="col-span-12 min-[900px]:col-span-3">
          <dl
            className="border-t border-hairline pt-[clamp(1rem,2.5vh,1.5rem)] min-[900px]:sticky min-[900px]:top-[calc(var(--nav-h)+clamp(1.5rem,4vh,2.5rem))]"
            data-rise
          >
            <RailItem term="Published">
              {publishedAt ? (
                <time dateTime={publishedAt}>
                  {DAY.format(new Date(publishedAt))}
                </time>
              ) : null}
            </RailItem>
            <RailItem term="Words by">{byline}</RailItem>
            <RailItem term="Reading">{`${minutes} min`}</RailItem>
          </dl>
        </aside>

        <div className="col-span-12 min-[900px]:col-span-8 min-[900px]:col-start-5">
          <Prose className={`${COLUMNS} ${LEDE}`} value={body} />
        </div>
      </div>
    </article>
  );
}
