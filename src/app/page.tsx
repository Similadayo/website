import Link from "next/link";
import { Database, MessageSquare, Users, FileText, ArrowRight, FlaskConical, ShieldCheck, Layers, Zap, Search, Route } from "lucide-react";
import styles from "@/components/home/Home.module.css";

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.heroWrap}>
        <div className={styles.heroGlow} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroLabel}>
            <span className="label-tag">
              <span className="dot-active" /> Brancr Studio · AI Workflow Prototypes
            </span>
          </div>
          <h1 className={styles.heroH1}>
            Practical AI workflows for{" "}
            <span className={styles.heroAccent}>recruiting firms, agencies,</span>
            {" "}and small SaaS teams
          </h1>
          <p className={styles.heroSub}>
            We design focused AI prototypes that help small teams reduce repetitive
            support, knowledge, recruiting, and admin work.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/contact" className="btn-primary">
              Book a discovery call <ArrowRight size={15} />
            </Link>
            <Link href="/demos" className="btn-ghost">
              View workflow demos
            </Link>
          </div>
          <p className={styles.heroNote}>No giant transformation promises. One workflow at a time.</p>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className={styles.trustStrip}>
        <div className="container">
          <p className={styles.trustLabel}>Built for operational teams</p>
          <div className={styles.trustPills}>
            <span className={styles.pill}>Recruiting Firms</span>
            <span className={styles.pill}>Marketing Agencies</span>
            <span className={styles.pill}>Small SaaS Teams</span>
            <span className={styles.pill}>Consulting Practices</span>
          </div>
        </div>
      </div>

      {/* ── Problems ── */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">The problem</span>
            <h2 className={styles.sectionH}>Your team is doing work<br />that shouldn't require a human.</h2>
            <p className={styles.sectionSub}>Repetitive tasks kill momentum. Here are the four we solve first.</p>
          </div>
          <div className={styles.problemsGrid}>
            {[
              { n: "01", text: "Scattered internal knowledge — no one can find the right doc fast." },
              { n: "02", text: "Support tickets that repeat the same 10 questions endlessly." },
              { n: "03", text: "Recruiters rewriting the same outreach emails for every candidate." },
              { n: "04", text: "Proposals and updates drafted from scratch every single time." },
            ].map((p) => (
              <div key={p.n} className={`card ${styles.problemCard}`}>
                <div className={styles.problemNum}>{p.n}</div>
                <p className={styles.problemText}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Workflow prototypes</span>
            <h2 className={styles.sectionH}>Four workflow categories. One approach.</h2>
            <p className={styles.sectionSub}>Each demo is a proof category — not a separate product. They all serve the same core offer.</p>
          </div>
          <div className={styles.solutionsGrid}>
            {[
              {
                icon: <Database size={18} />,
                title: "Internal Knowledge Assistant",
                desc: "Search SOPs, notes, and internal docs in seconds. No more hunting through folders or repeating Slack questions.",
                target: "Agencies · Small SaaS",
                href: "/demos/ika",
              },
              {
                icon: <MessageSquare size={18} />,
                title: "Support Assistant",
                desc: "Draft replies to repeated tickets, flag low-confidence answers, and keep humans in the loop on what matters.",
                target: "SaaS · Support Teams",
                href: "/demos/faq-assistant",
              },
              {
                icon: <Users size={18} />,
                title: "Recruiting Workflow Assistant",
                desc: "Summarize messy interview notes and generate first-draft outreach — all reviewed by the recruiter before sending.",
                target: "Recruiting Firms · Staffing",
                href: "/demos/rwa",
              },
              {
                icon: <FileText size={18} />,
                title: "Proposal & Admin Drafting",
                desc: "Turn raw meeting notes into a clean, structured first draft. Stop staring at a blank page.",
                target: "Agencies · Consulting",
                href: "/demos/proposals",
              },
            ].map((s) => (
              <div key={s.href} className={`card card-lift ${styles.solutionCard}`}>
                <div className={styles.solutionIcon}>{s.icon}</div>
                <h3 className={styles.solutionTitle}>{s.title}</h3>
                <p className={styles.solutionDesc}>{s.desc}</p>
                <div className={styles.solutionTarget}>{s.target}</div>
                <Link href={s.href} className={styles.solutionLink}>
                  View prototype <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process Preview ── */}
      <section className={styles.processSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Our method</span>
            <h2 className={styles.sectionH}>Four steps from problem to prototype.</h2>
          </div>
          <div className={styles.stepsRow}>
            {[
              { num: "01", title: "Identify", desc: "Map the workflow, the owner, and the exact bottleneck." },
              { num: "02", title: "Select", desc: "Pick one focused AI use case worth prototyping." },
              { num: "03", title: "Build", desc: "Develop a lightweight, human-reviewed prototype." },
              { num: "04", title: "Review", desc: "Test the output and define the next-step path." },
            ].map((s, i) => (
              <div key={s.num} className={styles.stepItem}>
                <div className={`card ${styles.stepCard}`}>
                  <div className={styles.stepNum}>Step {s.num}</div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
                {i < 3 && <div className={styles.stepArrow}><ArrowRight size={14} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Why this works</span>
            <h2 className={styles.sectionH}>A philosophy built around caution, not hype.</h2>
          </div>
          <div className={styles.whyGrid}>
            {[
              { icon: <FlaskConical size={15}/>, title: "Prototype-first", desc: "We validate before scaling. You see results before committing." },
              { icon: <ShieldCheck size={15}/>, title: "Human-in-the-loop", desc: "Every critical output is reviewed by your team. Always." },
              { icon: <Layers size={15}/>,      title: "Workflow-specific", desc: "Not a generic tool. Built around one real problem you actually have." },
              { icon: <Zap size={15}/>,         title: "Low-risk validation", desc: "Start small. Walk away if it's not working. No lock-in." },
              { icon: <Search size={15}/>,      title: "Transparent limitations", desc: "We label everything: prototype, demo, concept. No fake case studies." },
              { icon: <Route size={15}/>,       title: "Clear next steps", desc: "End with a recommendation, not a sales pitch." },
            ].map((w) => (
              <div key={w.title} className={`card ${styles.whyCard}`}>
                <div className={styles.whyIcon}>{w.icon}</div>
                <div>
                  <div className={styles.whyTitle}>{w.title}</div>
                  <div className={styles.whyDesc}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaH}>Ready to test your first AI workflow?</h2>
              <p className={styles.ctaSub}>Let's find one repetitive task your team should stop doing manually.</p>
              <div className={styles.ctaBtns}>
                <Link href="/contact" className="btn-primary">
                  Book a discovery call <ArrowRight size={15} />
                </Link>
                <Link href="/demos" className="btn-ghost">
                  Browse demos first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
