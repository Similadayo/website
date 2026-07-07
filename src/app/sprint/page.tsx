import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Workflow Sprint™",
  description: "The fixed-scope, fixed-price implementation that follows a Workflow Blueprint™ — with a written Definition of Done.",
};

export default function Sprint() {
  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">Product 02</p>
        <h1>Workflow Sprint™</h1>
        <p className="lede">
          The fix — only when a Blueprint says it&apos;s worth it. Fixed scope, fixed timeline,
          fixed price, a written Definition of Done.
        </p>
      </header>

      <section className="block">
        <div className="container">
          <div className="section-head"><p className="eyebrow">The problem</p><h2>Open-ended implementation is where agencies go to die.</h2></div>
          <p className="prose">
            Once a workflow&apos;s root cause is diagnosed, the temptation is to scope a broad
            transformation program. We resist it. A Sprint fixes the single highest-leverage part
            of the workflow the Blueprint identified — nothing more, nothing vaguer, and never
            sold without that Blueprint preceding it.
          </p>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Purpose &amp; buyer</p><h2>A named engagement with a fixed shape.</h2></div>
          <div className="product-meta">
            <div className="product-meta-row"><span className="k">Buyer</span><span className="v">A client whose Blueprint recommended proceeding, who has passed the Readiness Gate for implementation.</span></div>
            <div className="product-meta-row"><span className="k">Outcome</span><span className="v">The diagnosed workflow rebuilt, automated where warranted, tested, documented — your team trained to run it independently.</span></div>
            <div className="product-meta-row"><span className="k">When to use it</span><span className="v">Whenever a Blueprint&apos;s recommendation is accepted. Never sold standalone.</span></div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head"><p className="eyebrow">The Readiness Gate</p><h2>Not every willing buyer is a ready buyer.</h2></div>
          <p className="prose">
            Before a Sprint is contracted, four things must be true: a named internal owner with
            authority and availability; access to tools and people scheduled in writing; a stable
            tool stack for the Sprint&apos;s duration; and genuine volume in the workflow, so the
            fix pays for itself many times over. Clients who don&apos;t clear the gate are
            deferred with a written path to readiness, not rejected.
          </p>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Deliverables</p><h2>What you receive.</h2></div>
          <div className="grid-2">
            <div className="card"><h3>The rebuilt workflow</h3><p>Live and operating in your existing stack — no forced tool migration.</p></div>
            <div className="card"><h3>Configured automations</h3><p>Each one documented, tested, and shipped with a manual fallback.</p></div>
            <div className="card"><h3>A playbook</h3><p>Written so a new hire can run the workflow from the document alone.</p></div>
            <div className="card"><h3>Training + a support window</h3><p>Your team runs it themselves by the time the Sprint closes.</p></div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Definition of Done</p><h2>Observable states, checked — never a feeling.</h2></div>
          <p className="prose">
            Every Sprint&apos;s Definition of Done is written and signed before the clock starts.
            It describes things that can be verified: the workflow executing end-to-end on a real
            case, an automation firing correctly on its trigger, a team member running the process
            from documentation alone with no help. If it can&apos;t be checked, it isn&apos;t done.
          </p>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head"><p className="eyebrow">The guarantee</p><h2>Fixed price cuts both ways.</h2></div>
          <p className="prose">
            If the Definition of Done isn&apos;t met on the agreed terms, we continue at our own
            cost until it is, or refund by a defined schedule. The guarantee covers what we
            control — it never covers business outcomes your own execution determines. A guarantee
            we&apos;d resist honoring is a lie with a signature, so we don&apos;t write those.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head center"><p className="eyebrow">FAQ</p><h2>Common questions about the Sprint.</h2></div>
          <div className="faq-list">
            <details className="faq-item"><summary>Can scope change mid-Sprint?</summary><p>The current Sprint&apos;s scope is frozen. New needs get logged for a future engagement — the one exception is anything required to reach the existing Definition of Done, which is our cost under the guarantee.</p></details>
            <details className="faq-item"><summary>How long does a Sprint take?</summary><p>Set per engagement in the Blueprint&apos;s fix specification — typically ten to twenty working days, with the clock starting only once the Readiness Gate is cleared.</p></details>
            <details className="faq-item"><summary>What happens after the support window closes?</summary><p>Your team runs the workflow independently. That&apos;s the point — we earn repeat work through results, not dependency.</p></details>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="page-hero center cta-block">
            <h2 className="h2-cta">Start with the diagnosis.</h2>
            <div className="hero-cta">
              <Link href="/blueprint" className="btn btn-primary">See the Workflow Blueprint™ <ArrowRight /></Link>
              <Link href="/contact" className="btn btn-ghost">Talk to us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
