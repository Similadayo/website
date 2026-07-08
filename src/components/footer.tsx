import Link from "next/link";

const GROUPS = [
  {
    heading: "Method",
    links: [
      { href: "/methodology", label: "Methodology" },
      { href: "/blueprint", label: "Workflow Blueprint™" },
      { href: "/sprint", label: "Workflow Sprint™" },
    ],
  },
  {
    heading: "Evidence",
    links: [
      { href: "/reference-engagement", label: "Reference Engagement™" },
      { href: "/research", label: "Research" },
    ],
  },
  {
    heading: "Firm",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand-mark" aria-label="Brancr Labs home">
              <span className="brand-logo" role="img" aria-label="Brancr" />
            </Link>
            <p className="footer-tagline">
              Operational Intelligence firm. We diagnose and rebuild the recurring workflows a
              business runs on, before a line of software is written.
            </p>
            <p className="footer-location">Lagos, Nigeria. Working with teams across the US, UK, and EU.</p>
          </div>

          <nav className="footer-cols" aria-label="Footer">
            {GROUPS.map((g) => (
              <div className="footer-col" key={g.heading}>
                <h4>{g.heading}</h4>
                {g.links.map((l) => (
                  <Link key={l.href} href={l.href}>{l.label}</Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <p>© {year} Brancr Labs. All rights reserved.</p>
          <p className="footer-tag">Research → Services → Knowledge → Software</p>
        </div>
      </div>
    </footer>
  );
}
