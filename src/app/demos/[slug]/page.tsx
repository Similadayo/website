import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle, Target, Lightbulb, GitBranch, Users, FileText, MessageSquare, Database, CheckCircle, PlayCircle } from "lucide-react";
import styles from "@/components/demos/DemoDetail.module.css";
import DemoEmbed from "@/components/demos/DemoEmbed";

/* ─────────────────────────────────────────── */
/*         CASE STUDY DATA — all 4 demos       */
/* ─────────────────────────────────────────── */

const DEMOS: Record<string, CaseStudy> = {

  /* ── 1. SUPPORT ASSISTANT ───────────────── */
  "faq-assistant": {
    label: "Prototype Case Study",
    title: "Support Assistant Prototype for SaaS Teams",
    oneLineSummary: "A dual-view AI assistant that handles common support tickets with human review before any response is sent.",
    Icon: MessageSquare,

    overview: "This prototype demonstrates how a SaaS support team could use an AI assistant to handle frequently repeated tickets — without removing the human agent from the loop. The concept uses two separate views: a customer-facing chat interface and a behind-the-scenes agent dashboard where draft responses are reviewed and approved before being sent.",

    context: "SaaS support teams commonly handle high volumes of repetitive inquiries: billing questions, feature explanations, account issues, and how-to requests. These tickets rarely require deep specialist knowledge but still consume significant agent time. As the product grows, the same questions appear repeatedly — answered manually, one by one.",

    problem: "Agents spend a large portion of their day answering questions that have already been answered dozens of times. There is no systematic way to route low-complexity tickets automatically while keeping higher-stakes questions under manual control. The result is burnout, slower response times, and inconsistent support quality across agents.",

    goal: "Reduce the time agents spend on low-complexity repeated tickets, while keeping every response under human review before it reaches the customer. The goal is not to automate support — it is to give agents a strong starting point, not a finished product.",

    solution: [
      { step: "Customer submits a support question through the widget." },
      { step: "The system retrieves relevant help articles and constructs a draft response, tagged with the source used." },
      { step: "A confidence level is assessed: high, medium, or low." },
      { step: "High-confidence responses are surfaced to the customer with a 'Pending agent review' label." },
      { step: "Medium-confidence responses trigger a review flag — the agent sees the draft and source before it goes live." },
      { step: "Low-confidence or sensitive questions are escalated to the agent queue immediately, with the draft clearly marked for editing." },
    ],

    workflowBreakdown: {
      inputs: ["Customer submitted question", "Internal help documentation and FAQ content", "Mock ticket history"],
      processing: ["Semantic retrieval of relevant help articles (mocked RAG)", "Confidence scoring based on source quality and match strength", "Draft response generation with source reference attached"],
      outputs: ["Customer-facing draft response with source attribution", "Agent dashboard ticket with editable draft and review prompt", "Escalation flag for low-confidence or sensitive queries"],
    },

    uxDecisions: [
      { title: "Dual-pane layout", desc: "The customer view and agent dashboard run side by side to demonstrate the real-time relationship between AI-generated output and human review — a concrete way to show buyers how the handoff works." },
      { title: "Three-tier confidence model", desc: "High, medium, and low confidence states are made visible. This is not just a UX detail — it is a trust mechanism. Buyers can see that the system does not treat all outputs equally." },
      { title: "Draft labelling", desc: "All AI-generated responses are explicitly labelled as drafts in the interface. Nothing is sent until a human approves. This removes the most common objection buyers have: 'Will the AI send something wrong?'" },
      { title: "Source visibility", desc: "Every response shows which help article it came from. Agents can verify the source before approving. This prevents confident-sounding wrong answers from passing unnoticed." },
    ],

    screens: [
      { name: "Customer Chat Widget", purpose: "Where the customer submits questions and receives AI-assisted responses, clearly labelled as pending review.", whyItMatters: "Shows the end-user experience is clean and professional, not clearly automated." },
      { name: "Agent Dashboard — Open Tickets", purpose: "Lists all incoming tickets, escalation flags, and draft statuses. Agents see exactly which tickets need attention.", whyItMatters: "Demonstrates the agent retains full situational awareness — nothing is handled without their approval." },
      { name: "Ticket Detail — Draft Review", purpose: "Shows the draft response, the source article retrieved, the confidence level, and an edit-before-send control.", whyItMatters: "The core trust moment: agents see everything before a response goes out. This is the human-in-the-loop in practice." },
    ],

    humanInLoop: "The AI never sends a message autonomously. Every response — including high-confidence ones — passes through the agent dashboard before delivery. Agents review the draft, inspect the source document, edit freely, and explicitly approve. The prototype is built around approval-first, not automation-first.",

    expectedOutcome: "This workflow is designed to reduce time spent on repetitive Tier-1 tickets and improve response consistency. Agents could spend more of their time on escalated, complex, or relationship-sensitive cases. Exact reduction in ticket handling time would need validation against live ticket data in a real operating environment.",

    limitations: [
      "Built on mock ticket data and static help documentation — not connected to a live support system.",
      "Retrieval is simulated with pre-seeded responses, not production-grade RAG.",
      "No authentication, user accounts, or ticket persistence between sessions.",
      "Confidence scoring is approximated; production deployment would require calibration against real ticket resolution data.",
      "Does not yet support multi-turn conversation memory.",
    ],

    whyItMatters: "For SaaS teams scaling their support function, this type of workflow could reduce repetitive agent workload without sacrificing quality control. The human-review-first design means the risk of bad AI responses is structurally addressed, not just promised.",

    cta: "Support handling at scale without removing your team from the loop.",
  },

  /* ── 2. RECRUITING WORKFLOW ASSISTANT ───── */
  "rwa": {
    label: "Concept Workflow · Demo",
    title: "Recruiting Workflow Assistant for Staffing Firms",
    oneLineSummary: "A four-workflow AI assistant that reduces recruiter admin without touching hiring judgment.",
    Icon: Users,

    overview: "This prototype demonstrates how a recruiting or staffing firm could reduce the time spent on repetitive candidate admin — summarising interview notes, drafting outreach, refining job descriptions, and searching candidate profiles — using a structured AI assistant. Every output is treated as a first draft, reviewed and approved by the recruiter before use.",

    context: "Recruiting firms operate with high administrative overhead per candidate. Recruiters write summaries of interview notes, personalise outreach emails for each candidate, and refine job descriptions for each client role — largely from scratch each time. As the candidate volume grows, this admin load scales with it, consuming time that could be spent on relationship work and placement quality.",

    problem: "Recruiters duplicate effort constantly: the same note-to-summary process, the same outreach structure, the same job description edits — applied individually to each candidate and role. This is time-consuming, inconsistent across the team, and leaves less capacity for the strategic work that actually drives placements. There are no practical guardrails ensuring that the AI never makes a hiring decision — it should only accelerate the admin that surrounds it.",

    goal: "Reduce the time recruiters spend on repetitive admin work — note summarisation, outreach drafting, JD refinement, and candidate search — while keeping every output under recruiter review. Protect hiring judgment from AI substitution while supporting the process around it.",

    solution: [
      { step: "Recruiter pastes raw interview notes into the Summarize Notes workflow." },
      { step: "The assistant produces a structured candidate summary: profile overview, key strengths, identified concerns, and a suggested fit rating." },
      { step: "Recruiter reviews and edits the summary before it is used or shared." },
      { step: "In the Draft Outreach workflow, recruiter inputs candidate context and selects the outreach type. A personalised message draft is generated." },
      { step: "Recruiter reviews, edits for tone and accuracy, and sends." },
      { step: "In the Refine JD workflow, the recruiter pastes a rough job description and receives a structured, formatted version." },
      { step: "Candidate Search allows searching a mock profile database with AI-annotated relevance notes per result." },
    ],

    workflowBreakdown: {
      inputs: ["Raw interview notes (freeform text)", "Candidate context (name, role, stage)", "Rough job description copy", "Search query for candidate profiles"],
      processing: ["Structured extraction of key summary points from notes", "Template-matched outreach draft generation", "JD reformatting and clarity improvement", "Semantic matching across mock candidate profiles"],
      outputs: ["Structured candidate summary with fit assessment", "Personalised first-draft outreach message", "Reformatted and improved job description", "Ranked candidate list with AI relevance notes"],
    },

    uxDecisions: [
      { title: "Sidebar-first navigation", desc: "Four distinct workflow modules in a persistent sidebar. Recruiters jump between Summarize, Draft, Search, and Refine JD without losing context. This matches how recruiting workflows actually flow across a workday." },
      { title: "Explicit first-draft labelling", desc: "Every output panel is labelled 'First Draft — Recruiter review required'. This is not a disclaimer buried in Terms. It is front-and-centre in the UI, so reviewers understand their role without confusion." },
      { title: "Structured output format", desc: "Summaries use a consistent structure (Profile, Strengths, Concerns, Fit Rating) rather than free-form paragraph output. This makes review faster and helps the recruiter identify what needs editing at a glance." },
      { title: "Input-first interaction model", desc: "Each workflow starts with the recruiter's raw input (notes, context, JD copy). The AI response follows. This keeps the recruiter in the driving seat — they provide the substance, the AI provides form and structure." },
    ],

    screens: [
      { name: "Summarize Notes", purpose: "Takes raw interview notes as input and outputs a structured candidate summary for review.", whyItMatters: "The highest-volume admin task for recruiters. Doing this 10x faster means more capacity per recruiter." },
      { name: "Draft Outreach", purpose: "Generates personalised first-draft outreach messages based on candidate context and outreach type.", whyItMatters: "Outreach is highly repetitive but must feel personal. AI handles the structure; the recruiter handles the relationship." },
      { name: "Refine JD", purpose: "Reformats and improves rough job description copy into a structured, client-ready document.", whyItMatters: "JD quality directly affects candidate quality. A fast first-pass on structure gives the recruiter more time to improve substance." },
      { name: "Candidate Search", purpose: "Searches a mock candidate database and returns results with AI-annotated relevance notes.", whyItMatters: "Shows how AI can annotate search results to save time shortlisting, without removing the recruiter from the decision." },
    ],

    humanInLoop: "This prototype treats AI as a first-draft engine. No output is autonomous. The recruiter submits raw material, reviews the structured output, edits as required, and decides whether and how to use it. There is no auto-send, no autonomous shortlisting, and no AI involvement in final placement decisions. Hiring judgment stays entirely with the human.",

    expectedOutcome: "This workflow is designed to reduce time spent per candidate on admin tasks — primarily note summarisation and outreach drafting. It could allow recruiters to handle a higher candidate volume without a proportional increase in admin time. Actual efficiency gains would require measurement against baseline recruiter workflows.",

    limitations: [
      "Built on mock candidate profiles and simulated data — not integrated with any ATS.",
      "Summary and outreach generation uses pre-seeded response logic, not a live LLM API in production.",
      "No persistent candidate records, session storage, or team collaboration features.",
      "Fit rating in summaries is illustrative — production use requires clear criteria definition and human override.",
      "Candidate Search does not currently support filters beyond keyword input.",
    ],

    whyItMatters: "For staffing firms, recruiter admin overhead is one of the clearest bottlenecks between candidate volume and placement output. A structured AI assistant that accelerates note summarisation and outreach — without substituting recruiter judgment — directly addresses that constraint.",

    cta: "Reduce recruiter admin without touching hiring judgment.",
  },

  /* ── 3. INTERNAL KNOWLEDGE ASSISTANT ────── */
  "ika": {
    label: "Prototype Case Study",
    title: "Internal Knowledge Assistant for Small Agencies",
    oneLineSummary: "A conversational assistant that retrieves answers from internal documents, with source references shown for every response.",
    Icon: Database,

    overview: "This prototype explores how a small agency could make its internal documentation — SOPs, project notes, proposal templates, and process guides — searchable and reusable through a conversational interface. Instead of hunting across Google Docs or Notion, team members ask a question and receive a source-backed response they can verify and act on.",

    context: "Small agencies grow by accumulating institutional knowledge: how things are done, what works for which client types, how to write proposals, how to brief suppliers. This knowledge lives in scattered documents, in people's heads, and in old project folders. As teams grow or change, that knowledge becomes harder to access consistently — costing time on onboarding, proposal creation, and daily execution.",

    problem: "Team members repeatedly search across Google Drive, Notion, and old email threads to find process details, prior work, and reusable internal knowledge. Onboarding new team members is slow because knowledge is not surfaced — it must be learned person-to-person. Proposal work duplicates effort because past relevant work is hard to locate. Senior team members field the same internal questions repeatedly.",

    goal: "Make internal knowledge searchable through a conversational interface that returns source-backed answers. Reduce internal interruptions, speed up onboarding, and improve reuse of prior work without requiring extensive documentation restructuring.",

    solution: [
      { step: "Team member opens the knowledge assistant and types a query in natural language." },
      { step: "The system retrieves relevant sections from indexed internal documents." },
      { step: "A response is generated, referencing the specific documents and sections used." },
      { step: "Source citations are displayed inline, allowing the user to verify the original document before acting." },
      { step: "Suggested follow-up prompts help users navigate related knowledge without requiring precise search terms." },
    ],

    workflowBreakdown: {
      inputs: ["Natural language question from team member", "Indexed internal documents (SOPs, process guides, project notes, proposal templates)"],
      processing: ["Semantic retrieval of relevant document sections", "Response generation grounded in retrieved content", "Source citation extraction and formatting"],
      outputs: ["Conversational answer with inline source citations", "Reference links to specific documents", "Suggested follow-up prompts for deeper exploration"],
    },

    uxDecisions: [
      { title: "Source citation as a core UI element", desc: "Every response shows which document it came from. This is not a feature — it is the trust architecture of the tool. Without source visibility, users have no way to validate or build confidence in AI-generated answers." },
      { title: "Document sidebar panel", desc: "A persistent sidebar shows the list of indexed documents. This makes the boundaries of the assistant's knowledge explicit: users know what is and is not in scope, reducing the risk of trusting a response that came from an incomplete knowledge base." },
      { title: "Suggested prompts", desc: "Pre-seeded suggested queries help users discover what the assistant can do and guide initial engagement — particularly useful for new team members who do not yet know what internal knowledge exists." },
      { title: "Typing indicator", desc: "A typing indicator appears while the assistant retrieves and formulates responses. This small UX detail improves perceived responsiveness and sets appropriate expectations for response latency." },
    ],

    screens: [
      { name: "Chat Workspace", purpose: "The main interface where users ask knowledge questions and receive source-backed conversational responses.", whyItMatters: "Familiar chat interface minimises onboarding. No training required to start using it." },
      { name: "Source Citation Panel", purpose: "Inline source references below each response, linking to the specific document used.", whyItMatters: "The most important trust mechanism. Users validate the answer before acting on it." },
      { name: "Document Sidebar", purpose: "Shows all indexed documents with icons and names, indicating the scope of available knowledge.", whyItMatters: "Makes the assistant's knowledge boundaries visible. Prevents false confidence from out-of-scope queries." },
      { name: "Suggested Prompts", purpose: "Pre-seeded example queries that help users understand what the assistant can answer.", whyItMatters: "Reduces friction for new users and surfaces the most common use cases immediately." },
    ],

    humanInLoop: "The assistant surfaces document sections and generates responses — but the team member reads, verifies, and decides how to act. Source citations are shown so users can open the original document and assess context that may not have been captured in the generated response. The assistant is positioned as a search and retrieval layer, not an autonomous decision-maker.",

    expectedOutcome: "This workflow is designed to reduce time spent searching for internal information and improve knowledge reuse across the team. It could meaningfully reduce internal interruptions — particularly questions directed at senior team members who serve as informal knowledge hubs. Exact impact would need validation in a live operating environment.",

    limitations: [
      "Built on sample documentation — not connected to a live Notion, Google Drive, or document management system.",
      "Retrieval is simulated; production deployment requires a proper document ingestion pipeline and vector search infrastructure.",
      "No access control — all indexed documents are visible to all users in the demo.",
      "Does not handle multi-document synthesis well in its current state.",
      "Upload functionality is demonstrated in the UI but does not process documents in real-time.",
    ],

    whyItMatters: "For small agencies, knowledge is one of the most underused assets. This assistant type could reduce onboarding time, lower internal interruption costs, and improve proposal quality by making prior work easier to find and reuse. The value scales as the internal document library grows.",

    cta: "Turn scattered company knowledge into a searchable, source-backed workflow.",
  },

  /* ── 4. PROPOSAL & ADMIN DRAFTING ────────── */
  "proposals": {
    label: "Concept Workflow · Demo",
    title: "Proposal & Admin Drafting Workflow for Service Teams",
    oneLineSummary: "A structured drafting assistant that turns raw meeting notes into formatted first drafts — reviewed and approved before use.",
    Icon: FileText,

    overview: "This prototype demonstrates how a service team — agency, consulting practice, or professional services firm — could reduce the time spent on recurring writing tasks: proposals, client reports, meeting recaps, and client updates. The assistant takes unstructured notes as input and produces a structured first draft. The writer reviews, edits, and approves. No draft is used as-is.",

    context: "Service teams produce recurring written deliverables for clients: proposals to win new mandates, progress reports to update stakeholders, meeting recaps after each call, and client updates on project status. These documents follow consistent structures but require different content each time. Writing them from scratch is time-consuming, inconsistent across the team, and often delayed — creating bottlenecks in client communication and sales processes.",

    problem: "Proposal writing is treated as a blank-page problem when it is actually a structure problem. Teams repeatedly recreate the same skeleton — executive summary, scope, timeline, pricing — inserting different content each time. Meeting recaps follow the same format week after week. Client update emails repeat the same structure with different numbers. The cognitive overhead of starting from scratch, combined with the volume of these documents, creates consistent delivery bottlenecks.",

    goal: "Reduce the blank-page overhead of recurring client-facing documents by generating a structured first draft from raw notes. The goal is not to eliminate the writer — it is to eliminate the structural setup that precedes the real writing work.",

    solution: [
      { step: "Team member selects the document type from the sidebar: Proposal, Client Report, Meeting Recap, or Client Update." },
      { step: "Raw notes, context, and key points are entered into the input panel." },
      { step: "The assistant generates a structured first draft using the appropriate document format." },
      { step: "The draft is displayed with section labels and editable formatting." },
      { step: "The writer reviews, edits each section, adjusts tone, and finalises before sending or submitting." },
    ],

    workflowBreakdown: {
      inputs: ["Raw meeting notes or bullet points", "Client context (name, project, stage)", "Document type selection (proposal, report, recap, update)"],
      processing: ["Document type detection and template selection", "Structured section generation from input content", "Format and heading application for each document type"],
      outputs: ["Structured first draft with appropriate headings and sections", "Editable text sections for review and rewrite", "Export-ready formatted document"],
    },

    uxDecisions: [
      { title: "Document type sidebar", desc: "Proposals, Reports, Meeting Recaps, and Client Updates are distinct workflow contexts — each requiring a different structure. The sidebar separates them clearly so the user's intent is explicit before drafting begins." },
      { title: "Input-first interaction model", desc: "The writer provides the substantive content — notes, context, key points. The AI provides structure and formatting. This keeps the writer's expertise and knowledge central to the output." },
      { title: "Step-by-step drafting wizard", desc: "A multi-step wizard guides the writer through providing the right inputs for the document type selected. This reduces incomplete prompts and improves output quality without requiring the user to understand prompt engineering." },
      { title: "Section-visible output", desc: "The generated draft displays each document section separately, clearly labelled. Writers can review and edit section by section rather than reading a monolithic block of generated text." },
    ],

    screens: [
      { name: "Document Type Sidebar", purpose: "Navigation between the four document types: Proposal, Client Report, Meeting Recap, Client Update.", whyItMatters: "Different document types require different structures. An explicit selector prevents generic outputs." },
      { name: "Input Panel — Notes Entry", purpose: "Where the writer pastes raw notes, context, and key points relevant to this document.", whyItMatters: "The quality of the output depends on the quality of the input. A structured input form improves output consistency." },
      { name: "Draft Preview", purpose: "The generated structured first draft with editable sections and clear formatting.", whyItMatters: "The review moment. Writers see the structure immediately, identify what needs editing, and begin polishing." },
      { name: "Drafting Wizard Steps", purpose: "A guided multi-step flow for collecting the inputs needed for more complex document types like proposals.", whyItMatters: "Reduces friction and incomplete submissions. Makes the tool feel guided, not raw." },
    ],

    humanInLoop: "Every output from this tool is a first draft, explicitly labelled as such in the interface. The writer is responsible for accuracy, tone, client-specific context, and final approval before any document is sent. The AI structures the content — the writer validates and owns the content. There is no auto-send or direct client delivery from within the tool.",

    expectedOutcome: "This workflow is designed to reduce time spent on structural setup for recurring client documents — the blank-page overhead before real writing begins. Service teams could produce first drafts of proposals, recaps, and updates faster, with more consistency across team members. Document volume that required hours of setup could be approached in minutes, leaving more time for editing and quality improvement. Exact gains require measurement against current baseline writing times.",

    limitations: [
      "Built as a front-end prototype — draft generation uses pre-seeded response logic, not a live LLM API.",
      "No integration with CRM, project management tools, or document storage.",
      "Does not currently support document export to PDF, Google Docs, or Word.",
      "No version history or multi-user collaboration features.",
      "Client-specific tone calibration requires manual editing — no brand voice model is implemented.",
    ],

    whyItMatters: "For service teams with high recurring output volume — proposals, reports, recaps — the structural setup cost adds up across every team member, every client, every engagement. A drafting assistant that eliminates the blank-page overhead without removing the writer from the process directly addresses one of the most consistent productivity drains in client-service work.",

    cta: "Speed up recurring client documents without removing your team from the writing process.",
  },
};

/* ─────────────────────────────────────────── */
/*                   TYPES                     */
/* ─────────────────────────────────────────── */

type CaseStudy = {
  label: string;
  title: string;
  oneLineSummary: string;
  Icon: React.ElementType;
  overview: string;
  context: string;
  problem: string;
  goal: string;
  solution: { step: string }[];
  workflowBreakdown: { inputs: string[]; processing: string[]; outputs: string[] };
  uxDecisions: { title: string; desc: string }[];
  screens: { name: string; purpose: string; whyItMatters: string }[];
  humanInLoop: string;
  expectedOutcome: string;
  limitations: string[];
  whyItMatters: string;
  cta: string;
};

/* ─────────────────────────────────────────── */
/*                   PAGE                      */
/* ─────────────────────────────────────────── */

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = DEMOS[slug] as CaseStudy | undefined;
  if (!demo) notFound();

  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.heroWrap}>
        <div className="container">
          <div className={styles.back}>
            <Link href="/demos" className="btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              <ArrowLeft size={15} /> Back to demos
            </Link>
          </div>
          <div className={styles.heroContent}>
            <span className="label-tag">{demo.label}</span>
            <h1 className={styles.h1}>{demo.title}</h1>
            <p className={styles.oneLineSummary}>{demo.oneLineSummary}</p>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW + CONTEXT ── */}
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className={styles.twoColGrid}>
            <div className={`card ${styles.block}`}>
              <div className={styles.blockLabel}><Target size={14} /> Overview</div>
              <p className={styles.blockText}>{demo.overview}</p>
            </div>
            <div className={`card ${styles.block}`}>
              <div className={styles.blockLabel}><Users size={14} /> Context</div>
              <p className={styles.blockText}>{demo.context}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM + GOAL ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.twoColGrid}>
            <div className={`card ${styles.blockAccented}`}>
              <div className={styles.blockLabel}><AlertTriangle size={14} /> The Problem</div>
              <p className={styles.blockText}>{demo.problem}</p>
            </div>
            <div className={`card ${styles.block}`}>
              <div className={styles.blockLabel}><Lightbulb size={14} /> The Goal</div>
              <p className={styles.blockText}>{demo.goal}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPOSED SOLUTION — step list ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHdr}>
            <span className="label-tag">Proposed Solution</span>
            <h2 className={styles.h2}>How the workflow runs</h2>
          </div>
          <div className={styles.stepList}>
            {demo.solution.map((s, i) => (
              <div key={i} className={styles.solutionStep}>
                <div className={styles.stepNumBadge}>{String(i + 1).padStart(2, "0")}</div>
                <p className={styles.stepText}>{s.step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW BREAKDOWN ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHdr}>
            <span className="label-tag">Workflow Breakdown</span>
            <h2 className={styles.h2}>What goes in, what comes out</h2>
          </div>
          <div className={styles.threeColGrid}>
            {[
              { label: "Inputs", items: demo.workflowBreakdown.inputs, color: "var(--fg-muted)" },
              { label: "Processing", items: demo.workflowBreakdown.processing, color: "var(--accent-light)" },
              { label: "Outputs", items: demo.workflowBreakdown.outputs, color: "#22c55e" },
            ].map(col => (
              <div key={col.label} className={`card ${styles.workflowCol}`}>
                <div className={styles.workflowColLabel} style={{ color: col.color }}>{col.label}</div>
                <ul className={styles.workflowList}>
                  {col.items.map((item, i) => (
                    <li key={i} className={styles.workflowItem}>
                      <span className={styles.workflowBullet} style={{ background: col.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UX DECISIONS ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHdr}>
            <span className="label-tag">Product & UX Decisions</span>
            <h2 className={styles.h2}>Why the interface was built this way</h2>
          </div>
          <div className={styles.uxGrid}>
            {demo.uxDecisions.map((d, i) => (
              <div key={i} className={`card ${styles.uxCard}`}>
                <div className={styles.uxTitle}>{d.title}</div>
                <p className={styles.uxDesc}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCREENS ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHdr}>
            <span className="label-tag">Screens & Walkthrough</span>
            <h2 className={styles.h2}>Key interface moments</h2>
          </div>
          <div className={styles.screensList}>
            {demo.screens.map((sc, i) => (
              <div key={i} className={`card ${styles.screenCard}`}>
                <div className={styles.screenMeta}>
                  <div className={styles.screenNum}>Screen {i + 1}</div>
                  <div className={styles.screenName}>{sc.name}</div>
                  <p className={styles.screenPurpose}>{sc.purpose}</p>
                  <div className={styles.screenWhy}>
                    <CheckCircle size={13} style={{ color: "#22c55e", flexShrink: 0 }} />
                    <span>{sc.whyItMatters}</span>
                  </div>
                </div>
                <div className={styles.screenPlaceholder}>
                  <demo.Icon size={28} style={{ color: "var(--fg-subtle)" }} />
                  <p className={styles.screenPlaceholderText}>{sc.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HUMAN-IN-THE-LOOP + EXPECTED OUTCOME ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.twoColGrid}>
            <div className={`card ${styles.trustCard}`}>
              <div className={styles.trustIcon}><ShieldCheck size={20} /></div>
              <div className={styles.metaLabel}>Human-in-the-Loop Logic</div>
              <p className={styles.blockText}>{demo.humanInLoop}</p>
            </div>
            <div className={`card ${styles.block}`}>
              <div className={styles.blockLabel}><GitBranch size={14} /> Expected Outcome</div>
              <p className={styles.blockText}>{demo.expectedOutcome}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIMITATIONS ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`card ${styles.limitationsCard}`}>
            <div className={styles.limitationsHdr}>
              <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
              <span className={styles.limitationsLabel}>Risks & Limitations</span>
            </div>
            <ul className={styles.limitationsList}>
              {demo.limitations.map((l, i) => (
                <li key={i} className={styles.limitationItem}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`card ${styles.whyCard}`}>
            <div className={styles.blockLabel}>Why this matters for the target team</div>
            <p className={styles.whyText}>{demo.whyItMatters}</p>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO EMBED ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHdr}>
            <span className="label-tag"><PlayCircle size={12} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />Live Demo</span>
            <h2 className={styles.h2}>Try it yourself</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--fg-muted)", marginTop: "0.5rem" }}>
              This is the actual prototype — fully interactive. Click through the interface below.
            </p>
          </div>
          <DemoEmbed slug={slug} title={demo.title} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaH}>{demo.cta}</h2>
            <p className="text-muted" style={{ marginBottom: "2rem", fontSize: "1.05rem" }}>
              Let's find out if a similar workflow fits your team.
            </p>
            <Link href="/contact" className="btn-primary">
              Book a discovery call <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
