"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/offer", label: "Offer" },
  { href: "/demos", label: "Demos" },
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
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            <img src="/brancr-logo.svg" alt="" className={styles.logoImage} />
          </span>
          <span>
            Brancr <span className={styles.logoSub}>Labs</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button onClick={toggle} className={styles.themeBtn} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/contact" className={styles.cta}>
            Start a conversation
          </Link>
        </div>

        <div className={styles.mobileRow}>
          <button onClick={toggle} className={styles.themeBtn} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className={styles.menuBtn} onClick={() => setOpen((value) => !value)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.drawer}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className={styles.drawerCta} onClick={() => setOpen(false)}>
            Start a conversation
          </Link>
        </div>
      )}
    </header>
  );
}
