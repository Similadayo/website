import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Reference Engagement™ — Nova Design",
  description: "Our first Reference Engagement — a self-funded proof of the method, built before any client existed to reference.",
};

export default function ReferenceEngagement() {
  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">Reference Engagement™</p>
        <h1>We ran the method on ourselves before we ever ran it on a client.</h1>
        <p className="lede">
          When Brancr started, there was no client history to reference yet — so we built one.
          Nova Design is a fictional subscription design agency; the diagnosis, the build, and
          every number below are real.
        </p>
        <div className="demo-note mt-lg">
          Nova Design is a self-funded demonstration, not a paying client. Every artifact here was
          built to prove the method works end to end — it establishes the pattern that future
          Reference Engagements, with real clients at pilot pricing, will follow.
        </div>
      </header>

      <section className="block">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Workflow</p><h2>Client onboarding for a subscription design agency.</h2></div>
          <div className="product-meta">
            <div className="product-meta-row"><span className="k">Problem</span><span className="v">Manual, tribal-knowledge onboarding — 30 hours of silence after payment, data re-typed into three disagreeing systems, kickoff forgotten in ~40% of cases.</span></div>
            <div className="product-meta-row"><span className="k">Fix</span><span className="v">An automated onboarding spine — payment triggers the entire sequence, with self-serve steps for the client and zero manual internal coordination.</span></div>
            <div className="product-meta-row"><span className="k">Root cause</span><span className="v">Four separate failures traced back to one missing part: no system fired when a client paid.</span></div>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head"><p className="eyebrow">The proof</p><h2>Scored on the same rubric, before and after.</h2></div>
          <div className="card card-lg">
            <div className="score-inline">
              <span className="score-label-sm">Before</span>
              <div className="score-track-sm"><div className="score-fill-sm fill-before" /></div>
              <span className="score-num-sm num-before">55</span>
            </div>
            <div className="score-inline">
              <span className="score-label-sm">After</span>
              <div className="score-track-sm"><div className="score-fill-sm fill-after" /></div>
              <span className="score-num-sm num-after">86</span>
            </div>
            <p className="prose mt-lg">
              Operational Health Score™, out of 100 — the same seven-dimension rubric applied to
              both states. Every point not recovered is a named, admitted gap (no push
              notifications yet, a simulated rather than live team-chat integration) rather than
              rounded away.
            </p>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Deliverables</p><h2>What we actually built.</h2></div>
          <div className="grid-4">
            <div className="card"><h3>Client portal</h3><p>Structured brief, asset upload, request submission, self-serve kickoff.</p></div>
            <div className="card"><h3>Client dashboard</h3><p>Graduates from checklist to active-project view once onboarding completes.</p></div>
            <div className="card"><h3>Internal automation</h3><p>Auto-created client record, project, and designer assignment — zero manual steps.</p></div>
            <div className="card"><h3>Playbook + SOPs</h3><p>Written to the stranger-test standard — a new hire can run it from the document alone.</p></div>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Outcome</p><h2>Payment to a fully assigned, notified project — logged to the second.</h2></div>
          <p className="prose">
            In the reference build, a seeded client goes from payment to an assigned, in-delivery
            project in roughly fourteen minutes, with every step timestamped in an audit trail —
            not claimed after the fact. The real-world target for a live client is under 48 hours,
            down from a 6.5-day baseline, once client response time is the only variable left in
            the loop.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="page-hero center cta-block">
            <h2 className="h2-cta">Want the same rigor applied to your workflow?</h2>
            <div className="hero-cta">
              <Link href="/contact" className="btn btn-primary">Start the conversation <ArrowRight /></Link>
              <Link href="/blueprint" className="btn btn-ghost">See the Workflow Blueprint™</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
