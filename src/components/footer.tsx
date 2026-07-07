import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <div>
            <Link href="/" className="brand-mark" aria-label="Brancr Labs home">
              <span className="brand-logo" role="img" aria-label="Brancr" />
            </Link>
            <p className="footer-meta" style={{ maxWidth: 320 }}>
              Operational Intelligence Firm. We diagnose and redesign recurring business
              workflows before technology is applied.
            </p>
          </div>
          <div className="footer-links">
            <Link href="/methodology">Methodology</Link>
            <Link href="/blueprint">Blueprint™</Link>
            <Link href="/sprint">Sprint™</Link>
            <Link href="/reference-engagement">Reference Engagement™</Link>
            <Link href="/research">Research</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <p className="footer-meta">© {new Date().getFullYear()} Brancr Labs.</p>
      </div>
    </footer>
  );
}
