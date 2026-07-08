"use client";

import { useEffect, useRef, useState } from "react";

// ── Brancr's hero visual: a live Operational Intelligence surface ────────────
// The protagonist is the business's *overall* Operational Health rising as the
// method is applied across its workflow portfolio — the discipline, not any one
// workflow. A trend sparkline climbs and an aggregate index counts up; the
// workflow list below shows breadth with honest states (onboarding is simply
// the one already redesigned, sitting among its peers — never the star).
// Real product surface, adapts to light/dark, static under reduced-motion.

type Tone = "warn" | "ok" | "muted" | "info";
type Row = { name: string; score: number; status: string; tone: Tone; pulse?: boolean };

// Honest portfolio at different stages of the method. Onboarding is the proven
// one (Stable). Four is enough: the point is the idea (a system of workflows
// moving through diagnosis), not completeness. Statuses are Brancr's own
// language, not generic project-tracker labels.
const ROWS: Row[] = [
  { name: "Sales Handoff", score: 49, status: "Diagnosing", tone: "warn", pulse: true },
  { name: "Proposal → Contract", score: 63, status: "Blueprint Ready", tone: "info" },
  { name: "Client Onboarding", score: 86, status: "Stable", tone: "ok" },
  { name: "Project Delivery", score: 71, status: "Monitoring", tone: "ok" },
];

const AGG_FROM = 58;
const AGG_TO = 81;

// Rising operational-health trend (higher y-value = lower on screen).
const SPARK: [number, number][] = [
  [0, 46], [34, 41], [68, 43], [102, 35], [136, 31], [170, 33], [204, 24], [238, 19], [272, 14], [300, 9],
];
const VBW = 300;
const VBH = 56;

const sparkY = (x: number) => {
  for (let i = 1; i < SPARK.length; i++) {
    const [x0, y0] = SPARK[i - 1];
    const [x1, y1] = SPARK[i];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return SPARK[SPARK.length - 1][1];
};
const lineD = SPARK.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
const areaD = `M 0 ${VBH} L ${SPARK.map(([x, y]) => `${x} ${y}`).join(" L ")} L ${VBW} ${VBH} Z`;

export function OperationalConsole() {
  const [t, setT] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  // One-shot climb on mount, then hold at the resolved state — so the panel
  // always comes to rest fully consistent (81 / +23 / full trend / rows), never
  // caught looping back to an empty, contradictory frame.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(1); return; }
    const DUR = 1800;
    let start: number | null = null;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const tick = (now: number) => {
      if (start === null) start = now;
      const p = Math.min((now - start) / DUR, 1);
      setT(ease(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const agg = Math.round(AGG_FROM + (AGG_TO - AGG_FROM) * t);
  const recovered = Math.round((AGG_TO - AGG_FROM) * t);
  const revX = t * VBW;

  return (
    <div className="oc-card">
      <div className="oc-bar">
        <span className="oc-dots"><i /><i /><i /></span>
        <span className="oc-bar-title">brancr · operational intelligence</span>
        <span className="oc-live"><span className="oc-live-dot" /> live</span>
      </div>

      <div className="oc-body">
        <div className="oc-metric">
          <p className="oc-metric-label">Operational Health · whole business</p>
          <p className="oc-metric-num">
            {agg}<span className="oc-metric-unit">/100</span>
            <span className="oc-delta">↑ +{recovered} after redesign</span>
          </p>
          <p className="oc-substat">8 workflows analyzed · 1 redesigned · {recovered} points recovered</p>
        </div>

        <div className="oc-spark">
          <svg viewBox={`0 0 ${VBW} ${VBH}`} preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="ocSparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
              </linearGradient>
              <clipPath id="ocReveal"><rect x="0" y="0" width={revX} height={VBH} /></clipPath>
            </defs>
            <path d={areaD} fill="url(#ocSparkFill)" clipPath="url(#ocReveal)" />
            <path d={lineD} fill="none" className="oc-spark-line" clipPath="url(#ocReveal)" />
            <line x1={revX} y1="0" x2={revX} y2={VBH} className="oc-spark-scan" />
            <circle cx={revX} cy={sparkY(revX)} r="3" className="oc-spark-dot" />
          </svg>
        </div>

        <p className="oc-section">Workflow health</p>

        {ROWS.map((r) => (
          <div className="oc-row" key={r.name}>
            <span className="oc-name">{r.name}</span>
            <span className="oc-track">
              <span className={`oc-fill ${r.tone}${r.pulse ? " pulse" : ""}`} style={{ width: `${r.score}%` }} />
            </span>
            <span className="oc-score">{r.score}</span>
            <span className={`oc-pill ${r.tone}${r.pulse ? " pulse" : ""}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
