import Link from "next/link";
import { CheckCircle2, PhoneCall, Search, Map, Cpu, Play, ArrowRight, X } from "lucide-react";
import styles from "@/components/offer/Offer.module.css";

export default function Offer() {
  return (
    <>
      {/* Hero */}
      <section className={styles.heroWrap}>
        <div className={`orb ${styles.orb1}`} />
        <div className="container">
          <div className={styles.heroCentred}>
            <span className="label-tag">The offer</span>
            <h1 className={styles.h1}>AI Workflow Audit <span className="gradient-text">+ Mini Prototype</span></h1>
            <p className={styles.sub}>
              We don't guess. We inspect one of your real workflows, find the friction, and build a focused
              AI prototype — so you can evaluate the value before committing to anything larger.
            </p>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHdr}>
            <h2 className={styles.h2}>What you receive</h2>
            <p className="text-muted text-lg">Six clear outputs from every engagement.</p>
          </div>
          <div className={styles.delivGrid}>
            {[
              { icon: <PhoneCall size={20}/>, label: "Discovery Call", desc: "We map your workflow landscape and surface priorities." },
              { icon: <Search size={20}/>,    label: "Workflow Analysis", desc: "Deep inspection of the tasks, friction points, and source data." },
              { icon: <Map size={20}/>,       label: "Opportunity Map", desc: "A clear view of what's worth automating and why." },
              { icon: <Cpu size={20}/>,       label: "Focused Prototype", desc: "A working lightweight demo of the AI workflow." },
              { icon: <Play size={20}/>,      label: "Walkthrough / Demo", desc: "We walk your team through the output, live." },
              { icon: <ArrowRight size={20}/>,label: "Next-Step Recommendation", desc: "Three honest paths: stop, refine, or implement." },
            ].map(d => (
              <div key={d.label} className={`card ${styles.delivCard}`}>
                <div className={styles.delivIcon}>{d.icon}</div>
                <div className={styles.delivLabel}>{d.label}</div>
                <div className={styles.delivDesc}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fit vs Not */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.fitRow}>
            <div>
              <span className="label-tag" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>Where this thrives</span>
              <div className={styles.fitList}>
                {["Repeated tier-1 support questions", "Scattered internal SOPs and knowledge", "Repetitive recruiter admin duties", "Recurring proposal and update drafting"].map(t => (
                  <div key={t} className={`card ${styles.fitItem}`}>
                    <CheckCircle2 size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="label-tag" style={{ marginBottom: "1.5rem", display: "inline-flex", color: "#ef4444", background: "#fef2f2", borderColor: "#fecaca" }}>Not a fit</span>
              <div className={styles.fitList}>
                {["Giant enterprise transformation projects", "High-risk compliance or legal workflows", "'Replace our whole team' automation requests", "Vague or undefined problem statements"].map(t => (
                  <div key={t} className={`card ${styles.notFitItem}`}>
                    <X size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHdr}>
            <h2 className={styles.h2}>Three honest paths forward</h2>
            <p className="text-muted text-lg">The next step is always your call.</p>
          </div>
          <div className="grid grid-3">
            {[
              { title: "Stop",     desc: "Walk away. It was a low-risk validation — no harm done." },
              { title: "Refine",   desc: "Iterate on the prototype with new constraints or new data." },
              { title: "Implement",desc: "Move into full implementation planning with a clear specification." },
            ].map(p => (
              <div key={p.title} className={`card ${styles.pathCard}`}>
                <h3 className={styles.pathTitle}>{p.title}</h3>
                <p className="text-muted text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaH}>Let's map your first workflow.</h2>
            <p className="text-muted text-lg" style={{ marginBottom: "2.5rem" }}>One call is enough to know if this is worth pursuing.</p>
            <Link href="/contact" className="btn-primary">Book a call <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>
    </>
  );
}
