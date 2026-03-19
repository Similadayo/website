"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/offer",   label: "Offer" },
  { href: "/demos",   label: "Demos" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Brancr<span className={styles.logoSub}>Labs</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${pathname === l.href ? styles.active : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className={styles.actions}>
          <button onClick={toggle} className={styles.themeBtn} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/contact" className="btn-primary">
            Book a Call
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className={styles.mobileRow}>
          <button onClick={toggle} className={styles.themeBtn} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className={styles.menuBtn} onClick={() => setOpen(v => !v)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.drawer}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="btn-primary" style={{ marginTop: "0.75rem" }} onClick={() => setOpen(false)}>
            Book a Call
          </Link>
        </div>
      )}
    </header>
  );
}
