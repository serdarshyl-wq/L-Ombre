# L’Ombre

A showcase site for a Paris advertising and creative studio — direction, film, CGI and sound. Obsidian and bone, Gambetta and Satoshi, scroll-driven motion from the first frame to the last.

**Live —** [lombre.temnyy.dev](https://lombre.temnyy.dev)

> **L’Ombre is not a real studio.** It was invented for this piece. The work shown is spec, the offices and telephone numbers belong to the fiction, and brand names that appear belong to their owners. The engineering, however, is real: the contact form sends actual email, the Journal is backed by a real CMS, and the site is deployed and indexed like any other.

---

## What this is

A single-developer build of the kind of site an agency would normally split across a designer, a front-end team and a back-end. It leans front-end and motion — that is the product here — but the server side is real work, not a mock: form handling, validation, rate limiting, mail delivery, a headless CMS with incremental regeneration, and the whole SEO surface.

The brief I set myself: a visitor should know what kind of studio this is before they read a word.

---

## The front of house

**A scroll-driven opening.** The landing sequence is not a timed animation — it is bound to scroll position, so the visitor sets the pace. Slogans pass, the mark is written, the navbar drops, and the hero lands. Returning to the home page from elsewhere in the site skips to the hero rather than replaying the whole thing.

**A horizontal gallery.** The Selection section pins and scrubs sideways. On touch it also responds to horizontal swipe, and reaching the last card carries straight on into the section below.

**Card to page.** Selecting a project lifts its frame off the grid and opens it into the project page. The layer that does this is attached to `<body>`, outside the React tree, so it keeps animating while the route changes underneath — there is no frame where the old page is gone and the new one hasn’t arrived.

**A masked reel.** On a project page the film stays fixed on the left while the right column runs its identity and details past it, all as one transform.

**A Journal in two catalogues.** Case studies (how a film was actually built) and Culture & Vision (writing). Filtering between them uses GSAP Flip, animating the grid height so nothing below jumps.

**Mobile is designed, not shrunk.** A hamburger panel that arrives from the top edge while the links rise from under their own containers; a footer whose categories fold into an accordion; cards resized so exactly one and a half fit a screen, with the caption moved beneath them because there is no hover to reveal it.

---

## The back of house

- **Contact form** — a Route Handler (`app/api/contact/route.js`) that re-validates the same schema the client uses, applies a rate limit and a honeypot, and delivers through Resend’s HTTP API with plain `fetch`. Replies go straight to the sender via `reply_to`; no SDK, and swapping providers means touching one function.
- **CMS** — Sanity Studio embedded at `/admin`, kept out of the site chrome by a route group and out of search engines by `robots.txt`. Journal content is fetched with GROQ and revalidated on a timer.
- **Static where it can be** — project pages are generated at build time from a local dataset; only Journal entries revalidate.
- **SEO** — per-page metadata, a single cross-linked JSON-LD graph, a generated sitemap and robots file.

---

## Engineering notes

The decisions that were not obvious:

**Scroll position is the only source of truth.** The intro, the horizontal gallery and the project reel are all scrubbed from it. On touch, a horizontal swipe is *converted into scroll* rather than driving the track directly — so the gesture and the timeline cannot desync, and overshooting the end of the gallery flows into the next section without any hand-off code.

**Capability queries, not width breakpoints, for touch.** Hover behaviour is gated on `(hover: hover)`. A 1024px tablet uses the desktop layout but has no cursor; keying on width alone would have made its content unreachable.

**Content lives in server HTML; motion only changes visibility.** No text is produced by JavaScript. Reveals animate `opacity`, `transform` and `clip-path` — never `display`, never mount-on-scroll. The closed state is written in CSS so nothing flashes before the animation takes over, and a `<noscript>` block undoes all of it.

**The client boundary sits at the leaves.** Pages are server components. Only the parts that move or listen ship JavaScript.

**One animation loop.** Lenis is driven by GSAP’s ticker with `ScrollTrigger.update` synced to it — no second `requestAnimationFrame` loop competing for frames.

**Type is measured, not guessed.** The shutter reveal reads the loaded font’s real cap metrics after `document.fonts.ready`, so the closing line sits on the letterforms instead of near them.

**Privacy by construction.** No cookies, no browser storage, no analytics, and no request to any third-party server — verified across every page. Remote CMS images are proxied through `next/image`, so a visitor’s browser never talks to the CDN.

**The fiction stops at the structured data.** JSON-LD carries no invented postal addresses, telephone numbers, founding dates or headcounts, because that markup is addressed to machines that cannot read a disclaimer. The fictional email and telephone links open a note explaining the piece instead of a mail client — which also means none of the invented numbers can actually be dialled.

**Reduced motion is a first-class path**, not a switch that empties the page.

---

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, JavaScript — no TypeScript |
| Styling | Tailwind CSS v4, theme in `@theme`, no config file |
| Motion | GSAP + ScrollTrigger + Flip, via `@gsap/react` |
| Scrolling | Lenis, on the GSAP ticker |
| CMS | Sanity v5, embedded studio |
| Mail | Resend (EU region) |
| Icons | lucide-react |
| Hosting | Vercel |

Fonts are self-hosted variable `woff2` files — Gambetta for display, Satoshi for text.

---

## Structure

```
src/
  app/
    (site)/          the site — route group keeps the studio out of its chrome
      page.jsx       home
      studio/  archive/  journal/  projets/  contact/
      cookies/  terms/  privacy/
      layout.jsx     navbar, footer, smooth scroll, JSON-LD
    admin/           embedded Sanity Studio
    api/contact/     form endpoint
    globals.css      theme tokens + section stylesheets
    sitemap.js  robots.js
  components/        27 components, client only where motion demands it
  styles/            one stylesheet per section, Tailwind @apply
  lib/               motion helpers, page transition, schema, validation
  sanity/            schemas and queries
public/
  fonts/  images/  videos/
```

---

## Running it

```bash
npm install
cp .env.example .env.local     # fill in the values
npm run dev
```

`http://localhost:3000` for the site, `/admin` for the studio.

```bash
npm run build     # production build
npm run lint      # eslint
```

### Environment

| variable | what it does |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap, JSON-LD — set it before the first production build |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset |
| `RESEND_API_KEY` | mail delivery (server only) |
| `CONTACT_TO` | where form messages land |
| `CONTACT_FROM` | sender, on a domain verified in Resend |

Without the last three the form returns 503 and logs what is missing, rather than quietly pretending to send.

---

## Credits

Design, engineering and copy by **Temnyy**.

If you would like something built to this standard, end to end — [temnyy.dev](https://temnyy.dev) · [Upwork](https://www.upwork.com/freelancers/~01d69f29e4f1440521)
