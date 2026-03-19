import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "@/components/process/Process.module.css";

const STEPS = [
  { n: "01", title: "Discovery", desc: "A focused call to understand the workflow, the tools in use, the bottlenecks, and who owns the process." },
  { n: "02", title: "Workflow Review", desc: "We inspect repeated tasks, source data quality, handoffs between people, and where operational drag actually lives." },
  { n: "03", title: "Opportunity Selection", desc: "We pick one narrow AI use case — specific enough to be buildable, relevant enough to be valuable, small enough to validate fast." },
  { n: "04", title: "Prototype Build", desc: "A lightweight working demo is built around your real workflow structure. Not a Figma screen — something you can interact with." },
  { n: "05", title: "Review & Recommendation", desc: "We test the output together, define what it can and cannot do, and lay out three honest next-step paths." },
];

export default function Process() {
  return (
    <>
      <section className={styles.heroWrap}>
        <div className="container">
          <div className={styles.heroCentred}>
            <span className="label-tag">How we work</span>
            <h1 className={styles.h1}>Our 5-step method</h1>
            <p className={styles.sub}>
              Structured, transparent, and low-risk. Every engagement follows the same disciplined process.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.stepsList}>
            {STEPS.map((s) => (
              <div key={s.n} className={`card ${styles.step}`}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaH}>Experience the process yourself.</h2>
            <p className="text-muted text-lg" style={{ marginBottom: "2.5rem" }}>One discovery call starts everything.</p>
            <Link href="/contact" className="btn-primary">Book a Discovery Call <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>
    </>
  );
}
