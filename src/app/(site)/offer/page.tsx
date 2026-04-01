import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, Map, PhoneCall, Play, Search, X } from "lucide-react";

export default function Offer() {
  return (
    <>
      <section className="site-section">
        <div className="container">
          <div className="site-card p-8 sm:p-12">
            <span className="site-eyebrow">The Offer</span>
            <h1 className="site-title mt-5">AI workflow audit plus a focused prototype.</h1>
            <p className="site-subtitle mt-6 max-w-2xl">
              We inspect one real workflow, identify the operational drag, and build a small prototype so you can judge the value before committing to a larger build.
            </p>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: <PhoneCall size={18} />, label: "Discovery Call", desc: "Map the workflow, the owner, and the friction clearly." },
              { icon: <Search size={18} />, label: "Workflow Analysis", desc: "Inspect repeated tasks, data quality, and decision bottlenecks." },
              { icon: <Map size={18} />, label: "Opportunity Map", desc: "Identify what is worth automating and what should remain human-led." },
              { icon: <Cpu size={18} />, label: "Focused Prototype", desc: "Build a lightweight working model around one use case." },
              { icon: <Play size={18} />, label: "Walkthrough", desc: "Review the prototype together and pressure-test the assumptions." },
              { icon: <ArrowRight size={18} />, label: "Recommendation", desc: "Choose whether to stop, refine, or implement further." },
            ].map((item) => (
              <div key={item.label} className="site-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[color:var(--site-accent-soft)] text-[color:var(--site-accent)]">{item.icon}</div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[color:var(--site-ink)]">{item.label}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--site-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="site-card p-8">
              <span className="site-eyebrow">Best Fit</span>
              <div className="mt-6 space-y-3">
                {[
                  "Repeated tier-1 support or recruiting outreach work",
                  "Scattered internal SOPs and knowledge",
                  "Manual recruiter or operations admin work",
                  "Recurring proposal and update drafting",
                ].map((item) => (
                  <div key={item} className="site-soft-card flex items-start gap-3 p-4">
                    <CheckCircle2 size={16} className="mt-1 text-[color:var(--site-olive)]" />
                    <span className="text-sm leading-7 text-[color:var(--site-muted)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="site-card p-8">
              <span className="site-eyebrow">Not A Fit</span>
              <div className="mt-6 space-y-3">
                {[
                  "Massive enterprise transformation projects",
                  "High-risk legal or compliance workflows",
                  "Requests to replace entire teams",
                  "Vague problem statements with no workflow owner",
                ].map((item) => (
                  <div key={item} className="site-soft-card flex items-start gap-3 p-4">
                    <X size={16} className="mt-1 text-red-500" />
                    <span className="text-sm leading-7 text-[color:var(--site-muted)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="site-card p-8 text-center sm:p-12">
            <span className="site-eyebrow">Next Step</span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">Map one workflow and see if the value is real.</h2>
            <p className="site-subtitle mx-auto mt-5 max-w-2xl">One call is enough to know whether this should stop, get refined, or move into implementation.</p>
            <div className="mt-8">
              <Link href="/contact" className="site-button">
                Book a call
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
