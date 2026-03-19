import Link from "next/link";
import { ArrowRight, Database, MessageSquare, Users, FileText } from "lucide-react";
import styles from "@/components/demos/Demos.module.css";

const DEMOS = [
  { slug: "ika",           label: "Prototype",        icon: <Database size={20}/>,      title: "Internal Knowledge Assistant",      desc: "Search SOPs and internal docs instantly. Stop hunting through folders.", target: "Agencies · Small SaaS" },
  { slug: "faq-assistant", label: "Prototype",        icon: <MessageSquare size={20}/>, title: "Support Assistant",                 desc: "Draft replies to repeated tickets with human review before sending.",    target: "SaaS · Support Teams" },
  { slug: "rwa",           label: "Concept Workflow", icon: <Users size={20}/>,         title: "Recruiting Workflow Assistant",      desc: "Summarize interview notes and draft outreach. Reviewed before sending.", target: "Recruiting · Staffing" },
  { slug: "proposals",     label: "Concept Workflow", icon: <FileText size={20}/>,      title: "Proposal & Admin Drafting Workflow", desc: "Turn raw notes into structured first drafts in seconds.",                target: "Agencies · Consulting" },
];

export default function DemosIndex() {
  return (
    <>
      <section className={styles.heroWrap}>
        <div className="container">
          <div className={styles.heroCentred}>
            <span className="label-tag">Workflow prototypes</span>
            <h1 className={styles.h1}>Four demos. One core offer.</h1>
            <p className={styles.sub}>
              These demos are proof categories — not separate products. They all support the same master offer:
              focused AI workflow prototypes for small teams.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.grid}>
            {DEMOS.map(d => (
              <Link key={d.slug} href={`/demos/${d.slug}`} className={`card card-lift ${styles.demoCard}`}>
                <div className={styles.top}>
                  <div className={styles.iconWrap}>{d.icon}</div>
                  <span className="label-tag" style={{ fontSize: "0.72rem" }}>{d.label}</span>
                </div>
                <h2 className={styles.demoTitle}>{d.title}</h2>
                <p className={styles.demoDesc}>{d.desc}</p>
                <div className={styles.demoBottom}>
                  <span className={styles.demoTarget}>{d.target}</span>
                  <span className={styles.demoLink}>View case study <ArrowRight size={14}/></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)", marginBottom: "1rem" }}>Don't see your workflow?</h2>
          <p className="text-muted text-lg" style={{ marginBottom: "2.5rem" }}>Book a call — we'll tell you if we can help.</p>
          <Link href="/contact" className="btn-primary">Book a discovery call <ArrowRight size={16}/></Link>
        </div>
      </section>
    </>
  );
}
