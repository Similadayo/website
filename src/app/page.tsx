import Link from "next/link";
import { ArrowRight, MetricArrow, Transform } from "@/components/icons";
import { FlowStrip } from "@/components/pipeline";
import { OperationalConsole } from "@/components/operational-console";
import { Reveal } from "@/components/reveal";

const DOMAINS = [
  { name: "Client Onboarding", active: true },
  { name: "Proposal → Contract", active: false },
  { name: "Sales Handoff", active: false },
  { name: "Client Reporting", active: false },
  { name: "Hiring", active: false },
  { name: "Customer Success", active: false },
  { name: "Vendor Intake", active: false },
  { name: "Project Delivery", active: false },
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero: the discipline, not a workflow ---------- */}
      <header className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Operational Intelligence Firm</p>
            <h1>Every company runs on recurring workflows it never actually designed.</h1>
            <p className="lede">
              Brancr Labs diagnoses and rebuilds those workflows, before a line of software is
              written, so growth stops leaking into coordination cost no one can see.
            </p>
            <div className="hero-cta">
              <Link href="/methodology" className="btn btn-primary">
                See how it works <ArrowRight />
              </Link>
              <Link href="/reference-engagement" className="btn btn-ghost">
                See the proof
              </Link>
            </div>
            <div className="hero-trust">
              <span className="dot" />
              One discipline. Many workflows. Mastered one at a time.
            </div>
          </div>

          <div className="hero-visual">
            <OperationalConsole />
          </div>
        </div>
      </header>

      {/* ---------- Operational Debt (the category problem) ---------- */}
      <section className="block tint">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">The problem</p>
              <h2>Operational Debt accumulates quietly.</h2>
              <p>
                You don&apos;t notice it. You work around it. Every hire and every tool adds another
                hand-off, and eventually the workarounds <em>are</em> how the company runs.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <FlowStrip steps={["Growing", "More people", "More tools", "More hand-offs", "More exceptions", "Operational Debt"]} />
          </Reveal>
          <div className="grid-4 mt-lg">
            <div className="card"><h3>Manual re-entry</h3><p>The same fact, typed into a second system, agreeing with neither.</p></div>
            <div className="card"><h3>Repeated questions</h3><p>The same information, chased and re-explained every time.</p></div>
            <div className="card"><h3>Nobody owns it</h3><p>Hand-offs stay fragile when steps depend on memory, not process.</p></div>
            <div className="card"><h3>Revenue leakage</h3><p>Clients waiting, early churn, hours coordinating instead of delivering.</p></div>
          </div>
        </div>
      </section>

      {/* ---------- One methodology, every workflow (breadth) ---------- */}
      <section className="block">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">The category</p>
              <h2>Operational Intelligence: one method, applied to any recurring workflow.</h2>
              <p>
                The workflows below are the operating system of a service business. Brancr&apos;s
                method applies to all of them. We prove it on one at a time, in public, before
                claiming the next.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="domain-grid">
              {DOMAINS.map((d) => (
                <div key={d.name} className={`domain${d.active ? " is-active" : ""}`}>
                  <span className={`tag ${d.active ? "tag-available" : "tag-investigating"}`}>
                    {d.active ? "Proven today" : "On the map"}
                  </span>
                  <span className="d-name">{d.name}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Why diagnosis first ---------- */}
      <section className="block tint">
        <div className="container">
          <Reveal>
            <div className="section-head center">
              <p className="eyebrow">Why diagnosis first</p>
              <h2>Software built on a guess is the most expensive way to be wrong.</h2>
              <p>Most firms buy the tool and hope. We find the root cause, prove it, then build only what the evidence justifies.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="beforeafter">
              <div className="ba-col before">
                <h4>Without diagnosis</h4>
                <div className="ba-step">Problem</div>
                <div className="ba-step">Buy software</div>
                <div className="ba-step">Bolt it on</div>
                <div className="ba-step">Still broken</div>
              </div>
              <div className="ba-transform" aria-hidden><Transform /></div>
              <div className="ba-col after">
                <h4>With Brancr</h4>
                <div className="ba-step">Problem</div>
                <div className="ba-step">Diagnosis</div>
                <div className="ba-step">Evidence</div>
                <div className="ba-step">Implementation</div>
                <div className="ba-step">Automation</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Products: two feature rows ---------- */}
      <section className="block">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">How you engage us</p>
              <h2>Two products, in order. Never sold separately.</h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid-2">
              <div className="card card-lg">
                <span className="card-num">01 · Diagnose</span>
                <h3>Workflow Blueprint™</h3>
                <p>
                  A paid diagnostic. We map how one workflow actually operates, quantify where it&apos;s
                  failing on a scored rubric, and recommend the single highest-leverage fix. Or we tell
                  you honestly it isn&apos;t worth the cost. You own the findings either way.
                </p>
                <Link href="/blueprint" className="btn btn-ghost mt-md">
                  Read about the Blueprint <ArrowRight />
                </Link>
              </div>
              <div className="card card-lg">
                <span className="card-num">02 · Implement</span>
                <h3>Workflow Sprint™</h3>
                <p>
                  The fix, but only if the Blueprint says it&apos;s worth it. Fixed scope, fixed
                  timeline, fixed price, and a written Definition of Done. When it ships, your team
                  can run it without us.
                </p>
                <Link href="/sprint" className="btn btn-ghost mt-md">
                  Read about the Sprint <ArrowRight />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Reference Engagement: this is where Nova / onboarding lives ---------- */}
      <section className="block tint">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Proof, not a pitch</p>
              <h2>We prove the method in public before we sell it.</h2>
              <p>
                Our first Reference Engagement™ ran the entire method on one recurring workflow:
                client onboarding for a subscription design agency. We self-funded it, because when
                we started there was no client history to point to. Here&apos;s what changed, measured.
              </p>
            </div>
          </Reveal>
          <div className="metric-band">
            <Reveal delay={0}>
              <div className="metric">
                <p className="m-label">Time to first value</p>
                <div className="m-values">
                  <span className="m-before">6.5 days</span>
                  <span className="m-arrow"><MetricArrow /></span>
                  <span className="m-after">14 <span className="accent">min</span></span>
                </div>
                <p className="m-note">Payment to an activated, assigned client.</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="metric">
                <p className="m-label">Manual touchpoints</p>
                <div className="m-values">
                  <span className="m-before">7</span>
                  <span className="m-arrow"><MetricArrow /></span>
                  <span className="m-after">2</span>
                </div>
                <p className="m-note">Hand-offs that depended on someone remembering.</p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="metric">
                <p className="m-label">Operational Health Score™</p>
                <div className="m-values">
                  <span className="m-before">55</span>
                  <span className="m-arrow"><MetricArrow /></span>
                  <span className="m-after">86<span className="accent">/100</span></span>
                </div>
                <p className="m-note">Same rubric, scored before and after.</p>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <div className="mt-lg">
              <Link href="/reference-engagement" className="btn btn-primary">
                See the full Reference Engagement <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Flywheel ---------- */}
      <section className="block">
        <div className="container">
          <Reveal>
            <div className="section-head center">
              <p className="eyebrow">The flywheel</p>
              <h2>Every engagement makes the next one cheaper and sharper.</h2>
              <p>Research compounds into method; method compounds into software. Nothing is thrown away.</p>
            </div>
          </Reveal>
          <Reveal>
            <FlowStrip steps={["Research", "Blueprint™", "Sprint™", "Reference Engagement™", "Knowledge Capture", "Software"]} />
          </Reveal>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="block">
        <div className="container">
          <Reveal>
            <div className="cta-panel">
              <h2>Which workflow is costing you the most?</h2>
              <p>Tell us. We&apos;ll diagnose it, and prove it, before we build anything.</p>
              <div className="hero-cta">
                <Link href="/contact" className="btn btn-primary">
                  Start the conversation <ArrowRight />
                </Link>
                <Link href="/methodology" className="btn btn-ghost">
                  How it works
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
