import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Mail, Map, MessageSquare, PhoneCall, Search, ShieldCheck, Sparkles, Target, User, Workflow, X } from "lucide-react"

export const metadata: Metadata = {
  title: "Brancr Labs | Practical AI Workflow Systems for Recruiting Firms",
  description:
    "Brancr Labs is a software and AI workflow studio that helps recruiting firms reduce repetitive admin, drafting, and coordination one workflow at a time.",
  alternates: { canonical: "/" },
}

export default function Home() {
  return (
    <>
      <section className="site-section">
        <div className="container">
          <div className="site-card overflow-hidden p-8 sm:p-12 lg:p-16">
            <span className="site-eyebrow">Workflow Studio</span>
            <h1 className="site-title mt-5 max-w-5xl">
              Practical AI workflow systems for recruiting firms and lean service teams.
            </h1>
            <p className="site-subtitle mt-6 max-w-2xl">
              We inspect one repetitive workflow, map the friction, and build a focused prototype that helps your team move faster without losing human control.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="site-button">
                Start a workflow review
                <ArrowRight size={16} />
              </Link>
              <Link href="/demos" className="site-button-secondary">
                View demo workflows
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <Stat title="1 workflow" copy="Scoped tightly so value is easier to validate." />
              <Stat title="Human-reviewed" copy="Critical output still stays with your team." />
              <Stat title="Prototype-first" copy="Validate before committing to larger implementation." />
            </div>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="grid gap-4 lg:grid-cols-3">
            <InfoCard icon={<Mail size={18} />} title="Repeated drafting" body="Candidate outreach, client updates, and internal follow-ups consume more team time than they should." />
            <InfoCard icon={<MessageSquare size={18} />} title="Scattered context" body="Inboxes, docs, and chat threads slow decisions down because nobody can find the same answer twice." />
            <InfoCard icon={<Workflow size={18} />} title="Manual coordination" body="Handoffs stay fragile when operational steps depend on memory, rewriting, and repeated explanations." />
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="site-card p-8 sm:p-10">
              <span className="site-eyebrow">How We Work</span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">A practical method instead of a giant AI promise.</h2>
              <div className="mt-8 space-y-4">
                {[
                  "Review the workflow, the friction, and the ownership structure.",
                  "Choose one narrow opportunity that is buildable and commercially relevant.",
                  "Prototype the workflow around real tasks and real team output.",
                  "Pressure-test where automation helps and where human review should stay.",
                ].map((step, index) => (
                  <div key={step} className="site-soft-card flex gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--site-accent-soft)] text-sm font-black text-[color:var(--site-accent)]">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-[color:var(--site-muted)]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="site-card p-8 sm:p-10">
              <span className="site-eyebrow">What Changes</span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">The output should feel calmer, cleaner, and easier to run.</h2>
              <div className="mt-8 grid gap-4">
                <Outcome icon={<Target size={16} />} title="Less manual admin" body="Reduce repeated drafting and repetitive support work." />
                <Outcome icon={<Sparkles size={16} />} title="More consistent output" body="Give the team a strong first draft instead of a blank page every time." />
                <Outcome icon={<ShieldCheck size={16} />} title="Clearer oversight" body="Keep final judgment with the people who own the relationship or the risk." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="site-card p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="site-eyebrow">What You Get</span>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">The offer is a workflow audit plus a focused prototype.</h2>
                <p className="site-subtitle mt-5 max-w-2xl">
                  The work starts with diagnosis, moves through one narrow buildable opportunity, and ends with a clear recommendation instead of vague AI theatre.
                </p>
              </div>
              <Link href="/offer" className="site-button-secondary">
                Explore the full offer
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <OfferCard icon={<PhoneCall size={18} />} title="Discovery Call" body="Map the workflow, the owner, and the operational drag clearly." />
              <OfferCard icon={<Search size={18} />} title="Workflow Analysis" body="Inspect repeated tasks, handoff failures, and messy inputs." />
              <OfferCard icon={<Map size={18} />} title="Opportunity Map" body="Choose one use case that is worth validating quickly." />
            </div>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="site-card p-8 sm:p-10">
              <span className="site-eyebrow">Founder</span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">Built by an operator who cares more about useful systems than AI theatre.</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-[color:var(--site-muted)]">
                <p>
                  Brancr Labs is led by Similoluwa Ilesanmi. The work is intentionally narrow: inspect one messy workflow, identify the operational drag, and build something practical enough for a small team to actually use.
                </p>
                <p>
                  That means no giant transformation pitch, no fake autonomy claims, and no pressure to automate work that still needs human judgment. The goal is a calmer system with better handoffs, cleaner drafting, and clearer oversight.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="site-button-secondary">
                  Talk to Similoluwa
                </Link>
                <Link href="/process" className="site-button-secondary">
                  See how Brancr works
                </Link>
              </div>
            </div>

            <div className="site-card p-6 sm:p-8">
              <div className="overflow-hidden rounded-[28px] border border-[color:var(--site-border)] bg-[color:var(--site-accent-soft)]">
                <img
                  src="/founder-portrait.svg"
                  alt="Portrait placeholder for Similoluwa Ilesanmi, founder of Brancr Labs"
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--site-accent-soft)] text-[color:var(--site-accent)]">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xl font-semibold tracking-tight text-[color:var(--site-ink)]">Similoluwa Ilesanmi</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--site-soft)]">Founder, Brancr Labs</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <FounderStat title="Workflow-first" copy="Starts with the real operational pain before any tooling recommendation." />
                <FounderStat title="Human-in-loop" copy="Keeps review with the people who own the client relationship and risk." />
              </div>
            </div>
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
                  "Scattered SOPs or internal company knowledge",
                  "Manual recruiter, ops, or client-service admin",
                  "Recurring proposal, report, or update drafting",
                ].map((item) => (
                  <FitRow key={item} icon={<CheckCircle2 size={16} className="mt-1 text-[color:var(--site-olive)]" />} text={item} />
                ))}
              </div>
            </div>

            <div className="site-card p-8">
              <span className="site-eyebrow">Not A Fit</span>
              <div className="mt-6 space-y-3">
                {[
                  "Massive enterprise transformation programmes",
                  "High-risk legal or compliance-heavy workflows",
                  "Requests to replace whole teams with AI",
                  "Vague problems with no clear workflow owner",
                ].map((item) => (
                  <FitRow key={item} icon={<X size={16} className="mt-1 text-red-500" />} text={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="site-card p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="site-eyebrow">Process</span>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">A 5-step method designed to stay practical.</h2>
                <p className="site-subtitle mt-5 max-w-2xl">
                  Every engagement starts small so value can be tested before more complexity, tooling, or implementation cost gets introduced.
                </p>
              </div>
              <Link href="/process" className="site-button-secondary">
                See the full process
              </Link>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-5">
              {[
                { n: "01", title: "Discovery" },
                { n: "02", title: "Review" },
                { n: "03", title: "Selection" },
                { n: "04", title: "Prototype" },
                { n: "05", title: "Recommendation" },
              ].map((step) => (
                <ProcessStep key={step.n} n={step.n} title={step.title} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="site-card p-8 text-center sm:p-12">
            <span className="site-eyebrow">Next Step</span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--site-ink)]">Talk through one workflow worth improving.</h2>
            <p className="site-subtitle mx-auto mt-5 max-w-2xl">
              If there is a repetitive process slowing your team down, we can review it, scope it, and decide if a prototype-first approach makes sense.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="site-button">
                Request a workflow conversation
                <ArrowRight size={16} />
              </Link>
              <Link href="/offer" className="site-button-secondary">
                See the offer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="site-soft-card p-5">
      <p className="text-lg font-semibold tracking-tight text-[color:var(--site-ink)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--site-muted)]">{copy}</p>
    </div>
  )
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="site-card p-6 sm:p-8">
      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[color:var(--site-accent-soft)] text-[color:var(--site-accent)]">{icon}</div>
      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[color:var(--site-ink)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--site-muted)]">{body}</p>
    </div>
  )
}

function Outcome({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="site-soft-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--site-accent-soft)] text-[color:var(--site-accent)]">{icon}</div>
        <h3 className="text-lg font-semibold tracking-tight text-[color:var(--site-ink)]">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-7 text-[color:var(--site-muted)]">{body}</p>
    </div>
  )
}

function OfferCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="site-soft-card p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[color:var(--site-accent-soft)] text-[color:var(--site-accent)]">{icon}</div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-[color:var(--site-ink)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--site-muted)]">{body}</p>
    </div>
  )
}

function FitRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="site-soft-card flex items-start gap-3 p-4">
      {icon}
      <span className="text-sm leading-7 text-[color:var(--site-muted)]">{text}</span>
    </div>
  )
}

function ProcessStep({ n, title }: { n: string; title: string }) {
  return (
    <div className="site-soft-card p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-accent-soft)] text-sm font-black text-[color:var(--site-accent)]">
        {n}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-[color:var(--site-ink)]">{title}</h3>
    </div>
  )
}

function FounderStat({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="site-soft-card p-4">
      <p className="text-sm font-semibold tracking-tight text-[color:var(--site-ink)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[color:var(--site-muted)]">{copy}</p>
    </div>
  )
}
