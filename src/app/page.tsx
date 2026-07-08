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

// Symptoms first: the reader should recognize their own week before we name it.
const SYMPTOMS = [
  { name: "Waiting", line: "Work stalls in someone's inbox, and nobody notices until the client does." },
  { name: "Manual coordination", line: "A person spends their day chasing whether other people did what they said." },
  { name: "Context switching", line: "The same question answered across Slack, email, and three open tabs, all day." },
  { name: "Re-entry", line: "The same details typed into a second system that agrees with neither the first nor the client." },
  { name: "Unclear ownership", line: "Everyone assumes someone else has it. Sometimes no one does." },
  { name: "Repeated drafting", line: "Rewriting the same proposal or brief from scratch, because last time's version is lost." },
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero: lead with the problem, not the thesis ---------- */}
      <header className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Operational Intelligence Firm</p>
            <h1 className="hero-h1">
              Your company didn&apos;t get more complex.
              <span className="hero-h1-b">It got more expensive to run.</span>
            </h1>
            <p className="lede">
              We identify the recurring workflow costing your business the most, prove it with
              evidence, and redesign it before software is built.
            </p>
            <div className="hero-cta">
              <Link href="/methodology" className="btn btn-primary">
                Explore the methodology <ArrowRight />
              </Link>
              <Link href="/reference-engagement" className="btn btn-ghost">
                See a Reference Engagement
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <OperationalConsole />
          </div>
        </div>
      </header>

      {/* ---------- Recognition: "that's us" before any concept ---------- */}
      <section className="block tint">
        <div className="container">
          <Reveal>
            <div className="section-head center">
              <p className="eyebrow">The tells</p>
              <h2>It rarely looks dramatic. It looks like an ordinary Tuesday.</h2>
              <p>None of these is a crisis. That is exactly why they never get fixed.</p>
            </div>
          </Reveal>
          <div className="grid-3">
            {SYMPTOMS.map((s, i) => (
              <Reveal key={s.name} delay={(i % 3) * 70}>
                <div className="card">
                  <h3>{s.name}</h3>
                  <p>{s.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="recognition-line">
              Recognize two or three? You&apos;re not understaffed, and you don&apos;t need another tool.
              You&apos;re carrying <strong>Operational Debt</strong>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Insight: now name it, and reframe the fix ---------- */}
      <section className="block">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">The name for it</p>
              <h2>Operational Debt is the interest you pay on shortcuts nobody chose on purpose.</h2>
              <p>
                A workaround becomes the process. A hand-off becomes tribal knowledge. An exception
                becomes the only way anyone remembers how the work actually runs. It compounds
                quietly, and it&apos;s almost always misread: as a people problem you hire around,
                or a tooling problem you buy software for. It&apos;s neither. It&apos;s a diagnosis
                problem.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <FlowStrip steps={["Growing", "More people", "More tools", "More hand-offs", "More exceptions", "Operational Debt"]} />
          </Reveal>
        </div>
      </section>

      {/* ---------- The category: one method, an operating system of workflows ---------- */}
      <section className="block tint">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">The discipline</p>
              <h2>Every recurring workflow is part of one operating system. We work on it as one.</h2>
              <p>
                Onboarding, proposals, reporting, hiring, hand-offs: the same method diagnoses any
                of them. We prove it on one workflow at a time, in public, before claiming the next.
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
      <section className="block">
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

      {/* ---------- Proof: evidence before the product pitch ---------- */}
      <section className="block tint">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Proof, not a pitch</p>
              <h2>We ran the method in public, and measured what changed.</h2>
              <p>
                Our first Reference Engagement™ took one recurring workflow, client onboarding for a
                subscription design agency, and rebuilt it end to end. We self-funded it, because
                when we started there was no client history to point to. Here is what moved.
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

      {/* ---------- Product: how you engage us ---------- */}
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

      {/* ---------- Flywheel ---------- */}
      <section className="block tint">
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

      {/* ---------- Final CTA: make them diagnose themselves ---------- */}
      <section className="block">
        <div className="container">
          <Reveal>
            <div className="cta-panel">
              <h2>Does your team spend more time coordinating work than doing it?</h2>
              <p>If that landed, you already know which workflow to point us at. We&apos;ll diagnose it, and prove it, before we build anything.</p>
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
