export interface Essay {
  slug: string;
  title: string;
  dek: string;
  paragraphs: string[];
}

export const ESSAYS: Essay[] = [
  {
    slug: "why-growing-agencies-break-at-20-employees",
    title: "Why Growing Agencies Break at 20 Employees",
    dek: "The systems that got you here are the same systems that quietly stop working.",
    paragraphs: [
      "At five people, a service business runs on memory. Everyone knows everyone's clients, everyone's open items, everyone's exceptions. There's no workflow to break because there's barely a workflow at all, just a small group of people who talk constantly and remember everything.",
      "At twenty, that stops being true, usually before anyone notices. The founder can no longer hold every client relationship in their head. A new hire doesn't have three years of tribal context. The handoff that used to happen by someone glancing over (sales telling delivery a new client just signed) now depends on someone remembering to send a Slack message, and eventually, someone forgets.",
      "The first symptom is almost never framed as an operations problem. It shows up as a client complaint, a missed deadline, a new hire who takes two months to become useful when the founder expected two weeks. Leadership responds the way growing teams almost always do: hire a coordinator to hold the seams together by hand, or buy a tool that promises to automate a process nobody has actually mapped.",
      "Both responses treat the symptom. Neither touches the cause, which is that a workflow built for five people was never redesigned for twenty. The fix isn't more people watching the gaps, and it isn't more software automating an undocumented process. It's mapping the workflow as it actually runs today, at this size, and rebuilding the one part that's costing the most.",
      "This is the size where Brancr does its first work with most clients, and it's not a coincidence. Twenty employees is roughly where Operational Debt stops being an inconvenience and starts being a growth ceiling.",
    ],
  },
  {
    slug: "the-hidden-cost-of-manual-client-onboarding",
    title: "The Hidden Cost of Manual Client Onboarding",
    dek: "It never appears as a line item, which is exactly why it survives so long.",
    paragraphs: [
      "Ask most founders what onboarding costs them and they'll quote a number close to zero: a welcome email, an intake call, maybe a shared folder. Ask their ops lead the same question and you'll usually get a much longer, much less confident answer, because the real cost of onboarding rarely shows up on an invoice. It shows up as time.",
      "Time spent noticing a new client actually signed. Time re-typing the same information into a CRM, a project tool, and an invoice, because nothing shares a record. Time chasing brand assets that arrive as expiring links, screenshots, and PDFs. Time spent explaining, again, to a new hire, how onboarding is supposed to work, because it was never written down, only passed along.",
      "None of these costs are large individually. That's precisely the problem. A ten-minute chase for a missing file doesn't trigger anyone's attention the way a lost client does. It's only when you add up the coordination hours across every new client, every month, for a year, that the number becomes impossible to ignore. And by then, it's baked into how the business believes it has to operate.",
      "The second, quieter cost is churn in the first thirty days. A client's confidence in a vendor is set disproportionately by the first week, not the tenth month. An onboarding process that feels disorganized reads to a new client as a preview of everything that follows, whether or not that's fair. Early cancellations rarely get attributed to onboarding in a churn report. They just show up as \"wasn't the right fit,\" a diagnosis that treats the symptom as the cause.",
      "The fix is not more headcount and not a generic onboarding SaaS tool bought before anyone's mapped what the workflow actually needs. It's diagnosing the specific workflow, in the specific business, and fixing the one part that's actually leaking time and trust.",
    ],
  },
  {
    slug: "operational-debt-vs-technical-debt",
    title: "Operational Debt vs. Technical Debt",
    dek: "The analogy is deliberate, not decorative, and it points to the same fix.",
    paragraphs: [
      "Technical debt has a home in every engineering team's vocabulary: the fast fix shipped instead of the correct one, quietly making the codebase harder to change until someone finally pays down the interest. Most growing businesses have no equivalent term for the same thing happening to their operations, so it goes unnamed, and unaddressed, for years longer than it should.",
      "Operational Debt behaves identically. A workaround becomes the process. A manual handoff becomes tribal knowledge held by one person. An undocumented exception becomes the only way anyone actually remembers how a workflow runs. Nobody decided any of this on purpose. It accumulated one reasonable-in-the-moment shortcut at a time, the same way technical debt does.",
      "The interest is paid daily, in coordination time, onboarding delay, and error. Just like technical debt, it never appears as a discrete cost. Nobody logs a ticket for \"spent forty minutes today working around a process that should be automatic.\" It's absorbed into the ordinary friction of the day, which is exactly why it survives being fixed.",
      "Where the analogy is most useful is in what it implies about the fix. Nobody would ask an engineer to pay down technical debt without first reading the code. Yet plenty of businesses try to pay down Operational Debt by hiring a coordinator or buying software without ever mapping the workflow underneath, the operational equivalent of rewriting a system nobody has actually read.",
      "Operational Debt is a diagnosis problem before it is anything else. That is the entire premise this firm is built on, and it's why every engagement starts with mapping the workflow as it is, not as anyone assumes it to be.",
    ],
  },
];

export function getEssay(slug: string): Essay | undefined {
  return ESSAYS.find((e) => e.slug === slug);
}
