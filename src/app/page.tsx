import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function Home() {
  return (
    <>
      <header className="page-hero center container">
        <p className="eyebrow">Operational Intelligence Firm</p>
        <h1>Growing companies accumulate Operational Debt.</h1>
        <p className="lede">
          Brancr Labs diagnoses and redesigns recurring business workflows before technology is
          applied — helping growing service businesses eliminate hidden coordination costs with
          evidence-driven implementation.
        </p>
        <div className="hero-cta">
          <Link href="/methodology" className="btn btn-primary">
            See the methodology <ArrowRight />
          </Link>
          <Link href="/blueprint" className="btn btn-ghost">
            Explore the Workflow Blueprint™
          </Link>
        </div>
      </header>

      {/* ---------- Operational Debt ---------- */}
      <section className="block">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">The problem</p>
            <h2>Operational Debt accumulates quietly.</h2>
            <p>You don&apos;t notice it. You work around it. Eventually it becomes how your company operates.</p>
          </div>
          <div className="flow-vert">
            <div className="flow-step">Growing</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">More people</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">More tools</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">More handoffs</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">More exceptions</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step emphasis">Operational Debt</div>
          </div>
        </div>
      </section>

      {/* ---------- The Cost ---------- */}
      <section className="block tint">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">The cost</p>
            <h2>The symptoms are ordinary, repeated, and expensive.</h2>
          </div>
          <div className="grid-4">
            <div className="card"><h3>Manual re-entry</h3><p>The same fact, typed into a second system, agreeing with neither.</p></div>
            <div className="card"><h3>Repeated questions</h3><p>The same information, chased and re-explained every time.</p></div>
            <div className="card"><h3>Nobody owns the workflow</h3><p>Handoffs stay fragile when steps depend on memory, not process.</p></div>
            <div className="card"><h3>Revenue leakage</h3><p>Clients waiting, early churn, hours spent coordinating instead of delivering.</p></div>
          </div>
        </div>
      </section>

      {/* ---------- The Brancr Method ---------- */}
      <section className="block">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">The Brancr method</p>
            <h2>Diagnosis, before anything is built.</h2>
          </div>
          <div className="flow-vert">
            <div className="flow-step">Observe</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Diagnose</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Workflow Blueprint™</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Workflow Sprint™</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Knowledge Capture</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Pattern Library</div>
          </div>
        </div>
      </section>

      {/* ---------- Why diagnosis first ---------- */}
      <section className="block tint">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Why diagnosis first</p>
            <h2>Software built on a guess is the most expensive way to be wrong.</h2>
          </div>
          <div className="compare-grid">
            <div className="compare-col without">
              <h4>Without diagnosis</h4>
              <div className="compare-flow">
                <div className="flow-step">Problem</div>
                <div className="flow-step">Buy software</div>
                <div className="flow-step">Still broken</div>
              </div>
            </div>
            <div className="compare-col with">
              <h4>With Brancr</h4>
              <div className="compare-flow">
                <div className="flow-step">Problem</div>
                <div className="flow-step">Diagnosis</div>
                <div className="flow-step">Evidence</div>
                <div className="flow-step">Implementation</div>
                <div className="flow-step">Automation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Products ---------- */}
      <section className="block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How you engage us</p>
            <h2>Two things, in order — never sold separately.</h2>
          </div>
          <div className="grid-2">
            <div className="card">
              <h3>Workflow Blueprint™</h3>
              <p>
                A paid diagnostic. We map how your workflow actually operates, quantify where
                it&apos;s failing, and recommend the single highest-leverage fix — or tell you
                honestly it isn&apos;t worth the cost. You own the findings either way.
              </p>
              <Link href="/blueprint" className="btn btn-ghost mt-sm">
                Read about the Blueprint <ArrowRight />
              </Link>
            </div>
            <div className="card">
              <h3>Workflow Sprint™</h3>
              <p>
                The fix — only if the Blueprint says it&apos;s worth it. Fixed scope, fixed
                timeline, fixed price, a written Definition of Done. Your team can run it without
                us when it&apos;s done.
              </p>
              <Link href="/sprint" className="btn btn-ghost mt-sm">
                Read about the Sprint <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Current focus ---------- */}
      <section className="block tint">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Current focus</p>
            <h2>One workflow, mastered, before a second is attempted.</h2>
            <p>This is not a services menu. It&apos;s evidence of where the method is heading next.</p>
          </div>
          <table className="roadmap-table">
            <thead>
              <tr><th>Status</th><th>Workflow domain</th></tr>
            </thead>
            <tbody>
              <tr><td><span className="tag tag-available">Available today</span></td><td>Client Onboarding</td></tr>
              <tr><td><span className="tag tag-investigating">Under investigation</span></td><td>Proposal → Contract</td></tr>
              <tr><td><span className="tag tag-investigating">Under investigation</span></td><td>Client Reporting</td></tr>
              <tr><td><span className="tag tag-investigating">Under investigation</span></td><td>Hiring</td></tr>
              <tr><td><span className="tag tag-investigating">Under investigation</span></td><td>Sales Handoff</td></tr>
              <tr><td><span className="tag tag-investigating">Under investigation</span></td><td>Customer Success</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Reference Engagement teaser ---------- */}
      <section className="block">
        <div className="container">
          <div className="card card-lg">
            <p className="eyebrow">Proof, not a pitch</p>
            <h2 className="h2-cta mb-sm">Our first Reference Engagement™</h2>
            <p className="prose">
              We ran the method on a real recurring problem — client onboarding for a subscription
              design agency — self-funded, because when we started there was no client history to
              reference yet. Full workflow maps, before/after diagrams, and a timestamped proof of
              what changed.
            </p>
            <Link href="/reference-engagement" className="btn btn-primary mt-lg">
              See the Reference Engagement <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Flywheel ---------- */}
      <section className="block tint">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">The flywheel</p>
            <h2>Every engagement makes the next one cheaper and sharper.</h2>
          </div>
          <div className="flow-vert">
            <div className="flow-step">Research</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Blueprint™</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Sprint™</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Reference Engagement™</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Knowledge Capture</div>
            <div className="flow-arrow-v">↓</div>
            <div className="flow-step">Software</div>
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="block">
        <div className="container">
          <div className="page-hero center cta-block">
            <h2 className="h2-cta-lg">Think your workflow is broken?</h2>
            <p className="lede">Let&apos;s prove it first.</p>
            <div className="hero-cta">
              <Link href="/contact" className="btn btn-primary">
                Start the conversation <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
