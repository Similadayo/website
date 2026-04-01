import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { n: "01", title: "Discovery", desc: "Understand the workflow, the tools, the owner, and the pressure points." },
  { n: "02", title: "Workflow Review", desc: "Inspect repeated tasks, messy handoffs, and weak data inputs." },
  { n: "03", title: "Opportunity Selection", desc: "Choose one narrow use case that is worth validating quickly." },
  { n: "04", title: "Prototype Build", desc: "Build a working workflow model around the real task structure." },
  { n: "05", title: "Review & Recommendation", desc: "Test the output together and define the next practical step." },
];

export default function Process() {
  return (
    <>
      <section className="site-section">
        <div className="container">
          <div className="site-card p-8 sm:p-12">
            <span className="site-eyebrow">Process</span>
            <h1 className="site-title mt-5">A 5-step method designed to stay practical.</h1>
            <p className="site-subtitle mt-6 max-w-2xl">
              The process is structured, low-risk, and honest. Every engagement starts small so value can be tested before more complexity gets introduced.
            </p>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.n} className="site-card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--site-accent-soft)] text-xl font-black text-[color:var(--site-accent)]">
                  {step.n}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--site-ink)]">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--site-muted)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="site-card p-8 text-center sm:p-12">
            <span className="site-eyebrow">Start</span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">One discovery call is enough to begin.</h2>
            <p className="site-subtitle mx-auto mt-5 max-w-2xl">If there is a workflow your team keeps repeating, we can examine it and decide whether it deserves a prototype-first build.</p>
            <div className="mt-8">
              <Link href="/contact" className="site-button">
                Book a discovery call
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
