"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Roll from "@/components/Roll";
import { useLenis } from "@/components/SmoothScroll";
import {
  onNavGate,
  getNavState,
  getServerNavState,
} from "@/lib/nav-gate";

const LEFT = [
  { label: "Studio", href: "/studio" },
  { label: "Archive", href: "/archive" },
];

const CONTACT = "#contact";

const RIGHT = [
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];


const MENU = [...LEFT, ...RIGHT];

function NavLink({ label, href, onClick }) {
  if (href.startsWith("/")) {
    return (
      <Link className="nav__link group" href={href}>
        <Roll label={label} />
      </Link>
    );
  }

  return (
    <a className="nav__link group" href={href} onClick={onClick}>
      <Roll label={label} />
    </a>
  );
}

const THRESHOLD = 10;
const GRACE = 1600;

export default function Navbar() {
  const root = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();

  const [menu, setMenu] = useState(false);

  const state = useSyncExternalStore(
    onNavGate,
    getNavState,
    getServerNavState
  );

  const isHome = pathname === "/";
  const isProject = pathname.startsWith("/projets/");

  const allowed = isHome || isProject ? state.open : true;

  const solid = isHome ? state.solid : !isProject;

  const pinned = isProject;

  useGSAP(
    () => {
      gsap.set(root.current, { y: 0, yPercent: -100 });
    },
    { scope: root }
  );


  useEffect(() => {
    const nav = root.current;
    if (!nav) return;

    gsap.killTweensOf(nav);

    if (!allowed) {
      gsap.to(nav, { yPercent: -100, duration: 0.4, ease: "power3.in" });
      return;
    }

    gsap.to(nav, { yPercent: 0, duration: 0.8, ease: "power3.out" });

    if (pinned) return;

    let last = window.scrollY;
    let shown = true;
    const openedAt = performance.now();

    const show = (next) => {
      if (shown === next) return;
      shown = next;
      gsap.to(nav, {
        yPercent: next ? 0 : -100,
        duration: next ? 0.6 : 0.4,
        ease: next ? "power3.out" : "power3.in",
      });
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) < THRESHOLD) return;
      last = y;

      if (y <= 4) return show(true);
      if (delta < 0) return show(true);
      if (performance.now() - openedAt > GRACE) show(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [allowed, pinned]);

  useEffect(() => {
    if (!menu) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [menu, lenis]);


  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    setMenu(false);
  }

  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const guard = (href) => (e) => {
    if (href === "#") return e.preventDefault();
    if (href !== CONTACT) return;
    e.preventDefault();
    if (isHome) lenis?.to(CONTACT);
    else router.push("/");
  };

  return (
    <header className="nav" ref={root} data-solid={solid} data-menu={menu}>

      <div className="menu" data-open={menu} id="nav-menu" inert={!menu}>
        <div className="menu__sheet" aria-hidden="true" />

        <nav className="menu__body" aria-label="Menu">
          <ul>
            {MENU.map(({ label, href }, i) => (
              <li className="menu__row" key={label} style={{ "--i": i }}>
                <Link
                  className="menu__link"
                  href={href}
                  onClick={() => setMenu(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <button
        aria-controls="nav-menu"
        aria-expanded={menu}
        aria-label={menu ? "Close menu" : "Open menu"}
        className="nav__burger"
        onClick={() => setMenu((on) => !on)}
        type="button"
      >
        <span className="nav__burger-line" />
        <span className="nav__burger-line" />
      </button>

      <nav className="nav__col" aria-label="Studio">
        {LEFT.map(({ label, href }) => (
          <NavLink href={href} key={label} label={label} onClick={guard(href)} />
        ))}
      </nav>

      <Link className="nav__mark" href="/" lang="fr">
        L’Ombre
      </Link>

      <nav className="nav__col" aria-label="More">
        {RIGHT.map(({ label, href }) => (
          <NavLink href={href} key={label} label={label} onClick={guard(href)} />
        ))}
      </nav>

      <a className="cta group" href={CONTACT} onClick={guard(CONTACT)}>
        <span className="cta__fill" aria-hidden="true" />
        <Roll label="Let’s Talk" className="relative" swapClassName="text-obsidian" />
      </a>
    </header>
  );
}
