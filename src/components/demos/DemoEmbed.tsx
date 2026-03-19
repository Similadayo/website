"use client";
import { useState } from "react";
import { Maximize2, Minimize2, ExternalLink } from "lucide-react";
import styles from "./DemoEmbed.module.css";

interface DemoEmbedProps {
  slug: string;
  title: string;
}

export default function DemoEmbed({ slug, title }: DemoEmbedProps) {
  const [expanded, setExpanded] = useState(false);
  // Append /index.html to bypass the Next.js dynamic /demos/[slug] route
  // which would otherwise intercept and serve the case study page recursively
  const src = `/demos/${slug}/index.html`;

  return (
    <div className={`${styles.wrap} ${expanded ? styles.expanded : ""}`}>
      <div className={styles.bar}>
        <div className={styles.barLeft}>
          <div className={styles.dots}>
            <span /><span /><span />
          </div>
          <span className={styles.barTitle}>{title} — Live Demo</span>
          <span className={styles.badge}>Interactive</span>
        </div>
        <div className={styles.barRight}>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconBtn}
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
          <button
            className={styles.iconBtn}
            onClick={() => setExpanded(e => !e)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className={styles.frameWrap}>
        <iframe
          src={src}
          title={title}
          className={styles.frame}
          allow="clipboard-read; clipboard-write"
          loading="lazy"
        />
      </div>
    </div>
  );
}
