"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Primary site navigation. Deliberately minimal: no "Services," no "Pricing"
// (Brand Book Ch.12: those read as "traditional agency"). On small screens the
// links collapse into a toggled menu so navigation never disappears.
const LINKS = [
  { href: "/methodology", label: "Methodology" },
  { href: "/blueprint", label: "Blueprint" },
  { href: "/sprint", label: "Sprint" },
  { href: "/reference-engagement", label: "Reference Engagement" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="site-nav">
      <div className="container site-nav-inner">
        <Link href="/" className="brand-mark" aria-label="Brancr Labs home" onClick={() => setOpen(false)}>
          <span className="brand-logo" role="img" aria-label="Brancr" />
        </Link>

        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="nav-cta">
            Contact
          </Link>
        </div>

        <button
          type="button"
          className={`nav-toggle${open ? " is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav-mobile${open ? " is-open" : ""}`} hidden={!open}>
        <div className="container nav-mobile-inner">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-mobile-link" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="nav-mobile-cta" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
