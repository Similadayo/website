import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <div>
            <Link href="/" className={styles.logo}>
              Brancr<span className={styles.logoSub}>Labs</span>
            </Link>
            <p className={styles.desc}>
              AI workflow prototypes for small teams. One focused use case at a time.
            </p>
          </div>
          <div>
            <div className={styles.colHeading}>Navigation</div>
            <div className={styles.links}>
              <Link href="/" className={styles.link}>Home</Link>
              <Link href="/offer" className={styles.link}>Offer</Link>
              <Link href="/demos" className={styles.link}>Demos</Link>
              <Link href="/process" className={styles.link}>Process</Link>
              <Link href="/contact" className={styles.link}>Contact</Link>
            </div>
          </div>
          <div>
            <div className={styles.colHeading}>Connect</div>
            <div className={styles.links}>
              <a href="https://brancr.dev" target="_blank" rel="noreferrer" className={styles.link}>Brancr (parent)</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.link}>LinkedIn</a>
              <Link href="/contact" className={styles.link}>Book a Call</Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span className={styles.copy}>© {new Date().getFullYear()} Brancr Labs. AI workflow prototypes.</span>
          <div className={styles.legal}>
            <Link href="/privacy" className={styles.link}>Privacy</Link>
            <Link href="/terms"   className={styles.link}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
