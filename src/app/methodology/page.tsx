import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { FlowStrip } from "@/components/pipeline";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How Brancr diagnoses Operational Debt and redesigns the workflow underneath it.",
};

export default function Methodology() {
  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">Methodology</p>
        <h1>Operational Debt is a diagnosis problem, not a people problem, not a tooling problem.</h1>
        <p className="lede">
          This page is the method itself: how we find Operational Debt, how we diagnose it, how we
          fix it, and what we keep afterward so the next diagnosis is faster than the last.
        </p>
        <div className="mt-lg">
          <FlowStrip steps={["Observe", "Diagnose", "Blueprint™", "Sprint™", "Definition of Done", "Knowledge Capture"]} />
        </div>
      </header>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">01 · Operational Debt</p>
            <h2>The hidden cost of workarounds, manual coordination, and undocumented process.</h2>
          </div>
          <p className="prose">
            Operational Debt behaves exactly like technical debt. A workaround becomes the
            process. A manual handoff becomes tribal knowledge. An undocumented exception becomes
            the only way anyone remembers how the workflow actually runs. The interest is paid
            every day in coordination time, onboarding delay, and error. It is a cost that never
            appears as a line item, which is exactly why it survives so long unaddressed.
          </p>
          <p className="prose">
            It is almost always misdiagnosed. Felt as chaos, it looks like a people problem, so
            you hire a coordinator to hold the broken process together by hand. Felt as friction,
            it looks like a tooling problem, so you buy software to automate a process nobody has
            mapped.
            Both make the business feel like it&apos;s addressing the problem, and both make the
            underlying debt worse. Operational Debt is an evidence deficit. That is solved by
            diagnosis, not by hiring or buying.
          </p>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">02 · Diagnosis</p>
            <h2>We map the workflow as it actually runs, not as the org chart claims.</h2>
          </div>
          <div className="method-list">
            <div className="method-step">
              <div className="method-num">01</div>
              <div><h4>Current-state capture</h4><p>Structured interviews with the people who execute the workflow, plus the artifacts it actually produces: the real emails, forms, and handoffs, not the process document.</p></div>
            </div>
            <div className="method-step">
              <div className="method-num">02</div>
              <div><h4>Failure-point analysis</h4><p>Every step examined for the recurring failure classes: manual re-entry, handoffs without confirmation, waiting states with no owner, decisions made without information.</p></div>
            </div>
            <div className="method-step">
              <div className="method-num">03</div>
              <div><h4>Quantification</h4><p>Each failure point costed in the client&apos;s own units (hours, delay days, error rates, churned clients), not a generic benchmark.</p></div>
            </div>
            <div className="method-step">
              <div className="method-num">04</div>
              <div><h4>Prioritization</h4><p>One highest-leverage fix, ranked by cost-to-fix against value-of-fix. Never a transformation program.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">03 · Workflow Blueprint™</p>
            <h2>The paid diagnostic. A standalone product you own outright.</h2>
          </div>
          <p className="prose">
            The Blueprint is a documented map of your target workflow, its quantified failure
            points, and a single prioritized, scoped, priced recommendation, or an honest verdict
            against proceeding if the fix isn&apos;t worth its cost. Diagnosis is paid, never a
            free audit disguised as a sales tactic: a free diagnosis attracts buyers who value it
            at zero, and makes walking away from a bad-fit deal economically punishing instead of
            straightforward.
          </p>
          <Link href="/blueprint" className="btn btn-ghost">Read the full Blueprint page <ArrowRight /></Link>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">04 · Workflow Sprint™</p>
            <h2>The fix: fixed scope, fixed price, a written Definition of Done.</h2>
          </div>
          <p className="prose">
            When a Blueprint recommends proceeding, its final section is already the Sprint
            specification, with no second sales process. A Sprint has a name, a fixed timeline, a
            fixed price, printed exclusions, and a Readiness Gate that must pass before the clock
            starts. Ambiguity is our risk to carry, not yours.
          </p>
          <Link href="/sprint" className="btn btn-ghost">Read the full Sprint page <ArrowRight /></Link>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">05 · Definition of Done</p>
            <h2>Observable states, never sentiments.</h2>
          </div>
          <p className="prose">
            Every Sprint&apos;s Definition of Done is written and agreed before work starts, and
            it describes things that can be checked: a workflow that executes end-to-end on a
            real case, an automation that fires correctly on its trigger, a team member who can
            run the new process from documentation alone. &quot;The client is happy&quot; is a
            hoped-for correlate of Done. It is never the definition.
          </p>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">06 · Knowledge Capture</p>
            <h2>Every engagement must leave us smarter than it found us.</h2>
          </div>
          <p className="prose">
            An engagement that produced only revenue was half-delivered. Every Sprint captures its
            patterns, templates, and lessons. They&apos;re filed, not lost, so the tenth engagement
            in a workflow domain costs roughly half what the first one did. This compounding, not
            headcount and not AI, is the actual mechanism behind the flywheel on our home page.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">FAQ</p>
            <h2>Questions worth answering plainly.</h2>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary>Why do you charge for the diagnosis?</summary>
              <p>A free diagnosis attracts buyers who value it at zero, trains the market to expect unpaid work, and makes the &quot;walk away if it isn&apos;t worth it&quot; clause of our Promise economically impossible to honor. Paid diagnosis filters for serious buyers and funds its own rigor.</p>
            </details>
            <details className="faq-item">
              <summary>What if the Blueprint says the fix isn&apos;t worth it?</summary>
              <p>Then we say so, plainly, and you keep the Blueprint anyway. This happens by design. It&apos;s the clearest proof we&apos;re not selling you a Sprint you don&apos;t need.</p>
            </details>
            <details className="faq-item">
              <summary>Do you build custom software?</summary>
              <p>Not as a first step, and not on assumption. We implement operational systems, and only build software once the same fix has been sold and delivered by hand, repeatedly, to paying clients. See the Reference Engagement™ for exactly how that validation works.</p>
            </details>
            <details className="faq-item">
              <summary>What workflows do you work on today?</summary>
              <p>Client onboarding, exclusively, on purpose: one workflow mastered before a second is attempted. See the roadmap on our home page for what&apos;s under investigation next.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <Reveal>
            <div className="cta-panel">
              <h2>See the method turned into proof.</h2>
              <p>The Reference Engagement™ runs this entire process end to end, with every number logged.</p>
              <div className="hero-cta">
                <Link href="/reference-engagement" className="btn btn-primary">See the Reference Engagement <ArrowRight /></Link>
                <Link href="/contact" className="btn btn-ghost">Talk to us</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
