import Link from "next/link";

// Primary site navigation. Deliberately minimal — no "Services," no "Pricing"
// (Brand Book Ch.12: those read as "traditional agency"). Manifesto is
// deferred past v1 per the staged-launch discipline.
const LINKS = [
  { href: "/methodology", label: "Methodology" },
  { href: "/blueprint", label: "Blueprint" },
  { href: "/sprint", label: "Sprint" },
  { href: "/reference-engagement", label: "Reference Engagement" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  return (
    <nav className="site-nav">
      <div className="container site-nav-inner">
        <Link href="/" className="brand-mark" aria-label="Brancr Labs home">
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
      </div>
    </nav>
  );
}
