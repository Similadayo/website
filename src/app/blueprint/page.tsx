import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Workflow Blueprint™",
  description: "The paid diagnostic — a documented map of your workflow, its failure points, and the single highest-leverage fix.",
};

export default function Blueprint() {
  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">Product 01</p>
        <h1>Workflow Blueprint™</h1>
        <p className="lede">
          A paid, fixed-scope diagnostic. You own the findings outright, whether or not anything
          gets built afterward.
        </p>
      </header>

      <section className="block">
        <div className="container">
          <div className="section-head"><p className="eyebrow">The problem</p><h2>You feel the pain but can&apos;t point to the cause.</h2></div>
          <p className="prose">
            A recurring workflow — client onboarding, a handoff, a reporting cycle — is costing
            time, money, or client trust, but nobody has actually mapped it. Symptoms get
            misattributed to people or tools. The real cause stays invisible until someone studies
            the workflow as it&apos;s actually performed, not as anyone believes it runs.
          </p>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Purpose &amp; buyer</p><h2>A rigorous diagnosis, before any implementation is proposed.</h2></div>
          <div className="product-meta">
            <div className="product-meta-row"><span className="k">Buyer</span><span className="v">A prospect who has passed discovery and a Readiness Gate — a named owner, real volume, a stable tool stack.</span></div>
            <div className="product-meta-row"><span className="k">Outcome</span><span className="v">You own a rigorous diagnosis regardless of what happens next — and where warranted, a Sprint-ready specification.</span></div>
            <div className="product-meta-row"><span className="k">When to use it</span><span className="v">Always the first paid engagement. No Workflow Sprint™ is ever sold without one preceding it.</span></div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Process</p><h2>Five steps, in order.</h2></div>
          <div className="method-list">
            <div className="method-step"><div className="method-num">01</div><div><h4>Current-state capture</h4><p>Interviews, artifacts, and — where possible — direct observation of the workflow as it&apos;s actually run.</p></div></div>
            <div className="method-step"><div className="method-num">02</div><div><h4>Failure-point analysis</h4><p>Every step examined and coded against the recurring failure classes we&apos;ve seen across dozens of workflows.</p></div></div>
            <div className="method-step"><div className="method-num">03</div><div><h4>Prioritization</h4><p>Failure points ranked by cost-to-fix against value-of-fix. One highest-leverage recommendation, never a roadmap.</p></div></div>
            <div className="method-step"><div className="method-num">04</div><div><h4>Fix specification</h4><p>The recommendation is written to Sprint-ready precision — scope, timeline, price, Definition of Done.</p></div></div>
            <div className="method-step"><div className="method-num">05</div><div><h4>Honest verdict</h4><p>If nothing clears the value threshold, we say so, and you keep the diagnosis anyway.</p></div></div>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Deliverables</p><h2>What you receive.</h2></div>
          <div className="grid-2">
            <div className="card"><h3>Current-state workflow map</h3><p>The workflow as it&apos;s actually performed, with every gap from the official process named.</p></div>
            <div className="card"><h3>Failure-point register</h3><p>Each failure quantified in your own units — hours, delay, error rate, churn — not a generic benchmark.</p></div>
            <div className="card"><h3>Fix specification (or verdict)</h3><p>A Sprint-ready recommendation, or an honest case for why nothing here is worth fixing yet.</p></div>
            <div className="card"><h3>A walkthrough session</h3><p>We present the diagnosis and take questions — nothing here is a document you read alone.</p></div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head center"><p className="eyebrow">FAQ</p><h2>Common questions about the Blueprint.</h2></div>
          <div className="faq-list">
            <details className="faq-item"><summary>How long does a Blueprint take?</summary><p>Typically one to two weeks, depending on access to the people and artifacts involved in the workflow.</p></details>
            <details className="faq-item"><summary>What if we already know what&apos;s wrong?</summary><p>Your own diagnosis is a hypothesis to verify, not a scope to execute. Most workflows have a gap between the official process and the real one — that gap is usually where the cost actually lives.</p></details>
            <details className="faq-item"><summary>Does the Blueprint fee count toward a Sprint?</summary><p>No — it&apos;s priced and sold as a standalone product, on purpose, so the diagnosis is never a disguised deposit.</p></details>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="page-hero center cta-block">
            <h2 className="h2-cta">Start with a Workflow Blueprint™.</h2>
            <div className="hero-cta">
              <Link href="/contact" className="btn btn-primary">Talk to us <ArrowRight /></Link>
              <Link href="/sprint" className="btn btn-ghost">See the Workflow Sprint™</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
