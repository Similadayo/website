import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckSquare,
  Eye,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react"
import styles from "@/components/home/Home.module.css"

export const metadata: Metadata = {
  title: "Brancr Labs | Practical AI Workflow Systems for Recruiting Firms",
  description:
    "Brancr Labs is a software and AI workflow studio that helps recruiting firms reduce repetitive admin, drafting, and internal coordination one workflow at a time.",
  alternates: {
    canonical: "/",
  },
}

export default function Home() {
  return (
    <>
      <section className={styles.heroWrap}>
        <div className={styles.heroGlow} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroLabel}>
            <span className="label-tag">
              <span className="dot-active" /> Brancr Labs | Workflow Studio
            </span>
          </div>
          <h1 className={styles.heroH1}>
            Practical AI workflow systems for{" "}
            <span className={styles.heroAccent}>recruiting firms</span>
          </h1>
          <p className={styles.heroSub}>
            We build focused workflow systems that reduce repetitive admin, drafting,
            and internal coordination so small recruiting teams can work faster with
            more consistency.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/contact" className="btn-primary">
              Book a workflow review <ArrowRight size={15} />
            </Link>
            <Link href="/demos" className="btn-ghost">
              View demo workflows
            </Link>
          </div>
          <p className={styles.heroNote}>
            One workflow at a time. Scoped carefully. Human-reviewed where it matters.
          </p>
        </div>
      </section>

      <div className={styles.trustStrip}>
        <div className="container">
          <p className={styles.trustLabel}>Focused offer</p>
          <div className={styles.trustPills}>
            <span className={styles.pill}>Recruiting Firms First</span>
            <span className={styles.pill}>Also works for agencies</span>
            <span className={styles.pill}>Lean service teams</span>
            <span className={styles.pill}>Human-reviewed systems</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">What Brancr is</span>
            <h2 className={styles.sectionH}>
              A software and AI workflow studio that helps small teams improve one repetitive workflow at a time.
            </h2>
            <p className={styles.sectionSub}>
              We do not try to automate everything. We identify one bottleneck worth fixing,
              build a scoped workflow system around it, and test it in a practical way.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">What we help with</span>
            <h2 className={styles.sectionH}>The repetitive work that slows small recruiting teams down.</h2>
            <p className={styles.sectionSub}>
              The goal is not more AI for its own sake. The goal is less manual work,
              clearer handoffs, and more consistent output.
            </p>
          </div>
          <div className={styles.problemsGrid}>
            {[
              {
                n: "01",
                text: "Repetitive candidate and client outreach drafting that eats into recruiter time.",
              },
              {
                n: "02",
                text: "Interview notes, candidate summaries, and internal updates being rewritten from scratch.",
              },
              {
                n: "03",
                text: "Scattered knowledge across docs, inboxes, and chat, slowing down decisions and handoffs.",
              },
              {
                n: "04",
                text: "Admin-heavy coordination that makes team output inconsistent and harder to scale.",
              },
            ].map((item) => (
              <div key={item.n} className={`card ${styles.problemCard}`}>
                <div className={styles.problemNum}>{item.n}</div>
                <p className={styles.problemText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Outcomes</span>
            <h2 className={styles.sectionH}>What the work should actually change.</h2>
            <p className={styles.sectionSub}>
              Buyers do not need a clever demo. They need a workflow that reduces friction.
            </p>
          </div>
          <div className={styles.whyGrid}>
            {[
              {
                icon: <Workflow size={15} />,
                title: "Less manual admin",
                desc: "Reduce repetitive internal work so recruiters spend more time on high-value conversations.",
              },
              {
                icon: <FileText size={15} />,
                title: "More consistent output",
                desc: "Turn messy notes and repeated drafting into cleaner first drafts with less variation across the team.",
              },
              {
                icon: <Users size={15} />,
                title: "Faster internal coordination",
                desc: "Make it easier for small teams to share context, review work, and move candidates or clients forward.",
              },
            ].map((item) => (
              <div key={item.title} className={`card ${styles.whyCard}`}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <div>
                  <div className={styles.whyTitle}>{item.title}</div>
                  <div className={styles.whyDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Use cases</span>
            <h2 className={styles.sectionH}>Focused workflow builds, not broad AI promises.</h2>
            <p className={styles.sectionSub}>
              These are examples of the kinds of workflow systems Brancr Labs builds first.
            </p>
          </div>
          <div className={styles.solutionsGrid}>
            {[
              {
                icon: <Mail size={18} />,
                title: "Recruiting outreach workflows",
                desc: "Draft candidate or client outreach with stronger consistency while keeping human approval before anything is sent.",
                target: "For recruiting firms",
                href: "/demos/rwa",
              },
              {
                icon: <FileText size={18} />,
                title: "Notes-to-draft systems",
                desc: "Turn interview notes, internal updates, or rough inputs into a structured first draft your team can review and refine.",
                target: "For recruiting firms and agencies",
                href: "/demos/proposals",
              },
              {
                icon: <MessageSquare size={18} />,
                title: "Internal knowledge access",
                desc: "Make SOPs, team notes, and operational guidance easier to find so people stop asking the same internal questions repeatedly.",
                target: "For lean operational teams",
                href: "/demos/ika",
              },
              {
                icon: <ShieldCheck size={18} />,
                title: "Human-reviewed support drafting",
                desc: "Reduce repeated response work while keeping human sign-off on any customer-facing output.",
                target: "For adjacent service teams",
                href: "/demos/faq-assistant",
              },
            ].map((item) => (
              <div key={item.href} className={`card card-lift ${styles.solutionCard}`}>
                <div className={styles.solutionIcon}>{item.icon}</div>
                <h3 className={styles.solutionTitle}>{item.title}</h3>
                <p className={styles.solutionDesc}>{item.desc}</p>
                <div className={styles.solutionTarget}>{item.target}</div>
                <Link href={item.href} className={styles.solutionLink}>
                  View workflow example <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Proof structure</span>
            <h2 className={styles.sectionH}>Demos should show the workflow problem, not just the interface.</h2>
            <p className={styles.sectionSub}>
              Each workflow example is framed around the manual problem, the improved process,
              and where human oversight still stays in place.
            </p>
          </div>
          <div className={styles.riskGrid}>
            {[
              {
                icon: <MessageSquare size={16} />,
                title: "The old way",
                desc: "Repeated manual drafting, scattered context, and too much time spent rewriting work that looks almost the same every week.",
              },
              {
                icon: <Workflow size={16} />,
                title: "The improved way",
                desc: "A focused workflow system handles the repetitive part, organizes context better, and gives the team a clearer working path.",
              },
              {
                icon: <Eye size={16} />,
                title: "Human review stays",
                desc: "Critical messages, decisions, and final outputs still stay with the team. The system supports judgment; it does not replace it.",
              },
            ].map((item) => (
              <div key={item.title} className={`card ${styles.riskCard}`}>
                <div className={styles.riskIcon}>{item.icon}</div>
                <div>
                  <div className={styles.riskTitle}>{item.title}</div>
                  <div className={styles.riskDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">How we work</span>
            <h2 className={styles.sectionH}>A validation-first process that stays commercially realistic.</h2>
            <p className={styles.sectionSub}>
              The goal is to de-risk the work, not to drag you into a massive transformation project.
            </p>
          </div>
          <div className={styles.stepsRow}>
            {[
              {
                num: "01",
                title: "Workflow review",
                desc: "We identify the repetitive workflow, the bottleneck, and who inside the team actually owns it.",
              },
              {
                num: "02",
                title: "Scoped build",
                desc: "We define a focused workflow system around one clear operational problem instead of trying to fix everything at once.",
              },
              {
                num: "03",
                title: "Validation sprint",
                desc: "We test the workflow in practice, review the outputs, and pressure-test where human oversight needs to remain.",
              },
              {
                num: "04",
                title: "Next-step rollout",
                desc: "If the workflow proves useful, we refine it into a stronger implementation path instead of stopping at a demo.",
              },
            ].map((item, index) => (
              <div key={item.num} className={styles.stepItem}>
                <div className={`card ${styles.stepCard}`}>
                  <div className={styles.stepNum}>Step {item.num}</div>
                  <h3 className={styles.stepTitle}>{item.title}</h3>
                  <p className={styles.stepDesc}>{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className={styles.stepArrow}>
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Why Brancr</span>
            <h2 className={styles.sectionH}>Built for teams that want clarity, not AI hype.</h2>
            <p className={styles.sectionSub}>
              The approach is deliberately practical: focused scope, visible limitations, and human oversight by default.
            </p>
          </div>
          <div className={styles.whyGrid}>
            {[
              {
                icon: <CheckSquare size={15} />,
                title: "Focused scope",
                desc: "We start with one meaningful workflow instead of promising an unrealistic full-business AI overhaul.",
              },
              {
                icon: <Eye size={15} />,
                title: "Transparent limitations",
                desc: "We say what the workflow can and cannot do before you commit. No fake certainty, no hidden tradeoffs.",
              },
              {
                icon: <ShieldCheck size={15} />,
                title: "Human control",
                desc: "Important output stays reviewable and editable. The system supports people instead of bypassing them.",
              },
            ].map((item) => (
              <div key={item.title} className={`card ${styles.whyCard}`}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <div>
                  <div className={styles.whyTitle}>{item.title}</div>
                  <div className={styles.whyDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.founderWrap}>
            <div className={styles.founderText}>
              <span className="label-tag">Meet the founder</span>
              <h2 className={styles.founderH}>
                Practical workflow systems, built by someone who cares more about usable results than AI hype.
              </h2>
              <p className={styles.founderBio}>
                Brancr Labs is led by <strong>Similoluwa</strong>, a software engineer and product builder focused on
                practical AI workflow systems for small teams.
              </p>
              <p className={styles.founderBio}>
                I started Brancr Labs because too many businesses are being sold AI as hype when what they really need
                is a clear fix for one repetitive workflow bottleneck. Most small teams do not need a massive transformation project.
                They need a focused system that saves time, reduces manual work, and keeps human oversight where it matters.
              </p>
              <p className={styles.founderBio}>
                My approach is simple: identify one workflow worth improving, build a scoped solution around it, test it
                in practice, and refine from there. That means fewer vague promises, more usable systems, and a more
                realistic path from idea to working results.
              </p>
              <div className={styles.founderMeta}>
                <span className={styles.founderChip}>
                  <MapPin size={12} /> Remote | Global
                </span>
                <a href="mailto:contact@brancr.com" className={styles.founderChip}>
                  <Mail size={12} /> contact@brancr.com
                </a>
                <a
                  href="https://linkedin.com/company/brancr-ai-technologies"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.founderChip}
                >
                  LinkedIn
                </a>
              </div>
            </div>
            <div className={styles.founderCard}>
              <div className={styles.founderPortraitWrap}>
                <Image
                  src="/image.png"
                  alt="Portrait of Similoluwa, founder of Brancr Labs"
                  width={160}
                  height={160}
                  className={styles.founderPortrait}
                />
              </div>
              <div className={styles.founderName}>Similoluwa</div>
              <div className={styles.founderRole}>Software Engineer | Founder</div>
              <div className={styles.founderCompany}>Brancr Labs</div>
              <div className={styles.founderDivider} />
              <div className={styles.founderStat}>
                <span className={styles.founderStatNum}>1</span>
                <span className={styles.founderStatLabel}>Primary focus: recruiting workflow systems</span>
              </div>
              <div className={styles.founderStat}>
                <span className={styles.founderStatNum}>1</span>
                <span className={styles.founderStatLabel}>Workflow at a time, scoped carefully</span>
              </div>
              <div className={styles.founderStat}>
                <span className={styles.founderStatNum}>0</span>
                <span className={styles.founderStatLabel}>Interest in hype-heavy AI promises</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaH}>Talk through one repetitive workflow worth improving.</h2>
              <p className={styles.ctaSub}>
                If there is a manual process slowing your team down, we can review it, scope it,
                and decide whether it is worth turning into a focused workflow system.
              </p>
              <div className={styles.ctaBtns}>
                <Link href="/contact" className="btn-primary">
                  Request a workflow conversation <ArrowRight size={15} />
                </Link>
                <Link href="/demos" className="btn-ghost">
                  Browse workflow demos first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
