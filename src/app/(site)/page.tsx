import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
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

const painPoints = [
  {
    n: "01",
    text: "Repetitive candidate and client outreach drafting that keeps recruiters stuck in admin work instead of conversations.",
  },
  {
    n: "02",
    text: "Interview notes, candidate summaries, and internal updates being rebuilt from scratch every time.",
  },
  {
    n: "03",
    text: "Scattered context across inboxes, docs, and chat, slowing down handoffs and approvals.",
  },
  {
    n: "04",
    text: "Inconsistent internal processes that make a lean recruiting team harder to scale cleanly.",
  },
]

const outcomes = [
  {
    icon: <Workflow size={15} />,
    title: "Less repetitive admin",
    desc: "Reduce repeated drafting and operational overhead so more time goes to actual recruiting work.",
  },
  {
    icon: <FileText size={15} />,
    title: "More consistent output",
    desc: "Turn rough notes and scattered inputs into cleaner first drafts with less variance across the team.",
  },
  {
    icon: <Users size={15} />,
    title: "Faster team coordination",
    desc: "Make it easier for recruiters and operators to share context, review work, and move searches forward.",
  },
]

const useCases = [
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
    desc: "Make SOPs, playbooks, and operational notes easier to retrieve so people stop asking the same internal questions repeatedly.",
    target: "For lean service teams",
    href: "/demos/ika",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Human-reviewed support drafting",
    desc: "Reduce repeated response work while keeping human sign-off on any customer-facing output.",
    target: "For adjacent service teams",
    href: "/demos/faq-assistant",
  },
]

const proofItems = [
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
]

const processSteps = [
  {
    num: "01",
    title: "Workflow review",
    desc: "We identify the repetitive workflow, the operational bottleneck, and who inside the team actually owns it.",
  },
  {
    num: "02",
    title: "Scoped build",
    desc: "We define one focused system around one clear problem instead of trying to automate the whole business at once.",
  },
  {
    num: "03",
    title: "Validation sprint",
    desc: "We test the workflow in practice, review outputs with you, and pressure-test where human oversight should remain.",
  },
  {
    num: "04",
    title: "Rollout decision",
    desc: "If the workflow proves useful, we refine it into a stronger implementation path instead of stopping at a clever demo.",
  },
]

const whyBrancr = [
  {
    icon: <CheckSquare size={15} />,
    title: "Focused scope",
    desc: "We start with one important workflow instead of promising an unrealistic full-business AI overhaul.",
  },
  {
    icon: <Eye size={15} />,
    title: "Visible tradeoffs",
    desc: "We say what the workflow can and cannot do before you commit. No fake certainty and no vague magic language.",
  },
  {
    icon: <ShieldCheck size={15} />,
    title: "Human control",
    desc: "Important outputs stay reviewable and editable. The system supports people instead of bypassing them.",
  },
]

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
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
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
                We build focused workflow systems that reduce repetitive admin,
                drafting, and internal coordination so lean recruiting teams can
                work faster with more consistency.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/contact" className="btn-primary">
                  Book a workflow review <ArrowRight size={15} />
                </Link>
                <Link href="/demos" className="btn-ghost">
                  View workflow demos
                </Link>
              </div>
              <p className={styles.heroNote}>
                One workflow at a time. Scoped carefully. Human-reviewed where it
                matters.
              </p>
            </div>

            <div className={`card ${styles.heroPanel}`}>
              <div className={styles.heroPanelHeader}>
                <span className={styles.heroPanelTag}>Primary fit</span>
                <span className={styles.heroPanelMeta}>Recruiting firms first</span>
              </div>
              <div className={styles.heroPanelBody}>
                <div className={styles.heroSignal}>
                  <BriefcaseBusiness size={18} />
                  <div>
                    <strong>Who this is for</strong>
                    <span>Recruiting firms and lean service teams with repeated internal workflow friction.</span>
                  </div>
                </div>
                <div className={styles.heroSignal}>
                  <Workflow size={18} />
                  <div>
                    <strong>What changes</strong>
                    <span>Less manual drafting, cleaner handoffs, and more consistent operational output.</span>
                  </div>
                </div>
                <div className={styles.heroSignal}>
                  <ShieldCheck size={18} />
                  <div>
                    <strong>How we work</strong>
                    <span>Scoped workflow builds, validation-first delivery, and human oversight where it matters.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.trustStrip}>
        <div className="container">
          <p className={styles.trustLabel}>Focused offer</p>
          <div className={styles.trustPills}>
            <span className={styles.pill}>Recruiting firms first</span>
            <span className={styles.pill}>Workflow review before build</span>
            <span className={styles.pill}>Human-reviewed systems</span>
            <span className={styles.pill}>Also supports agencies and lean teams</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">What Brancr is</span>
            <h2 className={styles.sectionH}>
              A software and AI workflow studio that helps small teams improve one
              repetitive workflow at a time.
            </h2>
            <p className={styles.sectionSub}>
              We do not try to automate everything. We identify one bottleneck worth
              fixing, build a scoped workflow around it, and test it in a practical
              way.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">What we help with</span>
            <h2 className={styles.sectionH}>
              The repetitive work that slows small recruiting teams down.
            </h2>
            <p className={styles.sectionSub}>
              The goal is not more AI for its own sake. The goal is less manual work,
              clearer handoffs, and more consistent output.
            </p>
          </div>
          <div className={styles.problemsGrid}>
            {painPoints.map((item) => (
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
              Buyers do not need a clever demo. They need a workflow that reduces
              friction inside a real operating team.
            </p>
          </div>
          <div className={styles.whyGrid}>
            {outcomes.map((item) => (
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
            <span className="label-tag">Workflow examples</span>
            <h2 className={styles.sectionH}>
              Focused systems, not broad AI promises.
            </h2>
            <p className={styles.sectionSub}>
              These examples show the kinds of workflow systems Brancr Labs builds
              first.
            </p>
          </div>
          <div className={styles.solutionsGrid}>
            {useCases.map((item) => (
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
            <h2 className={styles.sectionH}>
              Demos should explain the workflow problem, not just show an interface.
            </h2>
            <p className={styles.sectionSub}>
              Each example is framed around the old manual process, the improved
              process, and where human oversight still stays in place.
            </p>
          </div>
          <div className={styles.riskGrid}>
            {proofItems.map((item) => (
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
            <h2 className={styles.sectionH}>
              A validation-first process that stays commercially realistic.
            </h2>
            <p className={styles.sectionSub}>
              The goal is to de-risk the work, not drag you into a massive
              transformation project.
            </p>
          </div>
          <div className={styles.stepsRow}>
            {processSteps.map((item, index) => (
              <div key={item.num} className={styles.stepItem}>
                <div className={`card ${styles.stepCard}`}>
                  <div className={styles.stepNum}>Step {item.num}</div>
                  <h3 className={styles.stepTitle}>{item.title}</h3>
                  <p className={styles.stepDesc}>{item.desc}</p>
                </div>
                {index < processSteps.length - 1 ? (
                  <div className={styles.stepArrow}>
                    <ArrowRight size={14} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="label-tag">Why Brancr</span>
            <h2 className={styles.sectionH}>
              Built for teams that want clarity, not AI hype.
            </h2>
            <p className={styles.sectionSub}>
              The approach is deliberately practical: focused scope, visible
              limitations, and human oversight by default.
            </p>
          </div>
          <div className={styles.whyGrid}>
            {whyBrancr.map((item) => (
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
            <div className={styles.founderVisual}>
              <div className={styles.founderPortraitFrame}>
                <Image
                  src="/image.png"
                  alt="Portrait of Similoluwa, founder of Brancr Labs"
                  width={720}
                  height={900}
                  className={styles.founderPortrait}
                  priority
                />
              </div>
              <div className={`card ${styles.founderQuote}`}>
                <p>
                  Most small teams do not need a massive AI transformation project.
                  They need a clear fix for one repetitive workflow.
                </p>
              </div>
            </div>

            <div className={styles.founderText}>
              <span className="label-tag">Meet the founder</span>
              <h2 className={styles.founderH}>
                Practical workflow systems, built by someone who cares more about
                usable results than AI theater.
              </h2>
              <p className={styles.founderBio}>
                Brancr Labs is led by <strong>Similoluwa</strong>, a software engineer
                and product builder focused on practical AI workflow systems for
                small teams.
              </p>
              <p className={styles.founderBio}>
                I started Brancr Labs because too many businesses are being sold AI
                as hype when what they really need is a clear fix for one repetitive
                workflow bottleneck. Most small teams do not need a massive
                transformation project. They need a focused system that saves time,
                reduces manual work, and keeps human oversight where it matters.
              </p>
              <p className={styles.founderBio}>
                My approach is simple: identify one workflow worth improving, build a
                scoped solution around it, test it in practice, and refine from
                there. That means fewer vague promises, more usable systems, and a
                more realistic path from idea to working results.
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
              <div className={styles.founderPoints}>
                <div className={styles.founderPoint}>
                  <span>Primary focus</span>
                  <strong>Recruiting workflow systems</strong>
                </div>
                <div className={styles.founderPoint}>
                  <span>Approach</span>
                  <strong>One workflow at a time, scoped carefully</strong>
                </div>
                <div className={styles.founderPoint}>
                  <span>Bias</span>
                  <strong>Useful systems over hype-heavy promises</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaH}>
                Talk through one repetitive workflow worth improving.
              </h2>
              <p className={styles.ctaSub}>
                If there is a manual process slowing your team down, we can review
                it, scope it, and decide whether it is worth turning into a focused
                workflow system.
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
