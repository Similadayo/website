import { NextResponse } from "next/server";

// Contact form handler. No database in this content site — logs the qualifying
// submission server-side. Swap the console.log for a real notification (email
// via Resend, a Slack webhook) when this goes to production; the request/response
// contract here doesn't need to change.
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as Record<string, string>;

  const required = ["name", "email", "company", "workflow"];
  for (const field of required) {
    if (!body[field]?.trim()) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  console.log(
    [
      "",
      "──────────────── CONTACT SUBMISSION ────────────────",
      `Name:      ${body.name}`,
      `Email:     ${body.email}`,
      `Company:   ${body.company}`,
      `Workflow:  ${body.workflow}`,
      `Volume:    ${body.volume ?? "—"}`,
      `Owner:     ${body.owner ?? "—"}`,
      `Tools:     ${body.tools ?? "—"}`,
      `Problem:   ${body.problem ?? "—"}`,
      "──────────────────────────────────────────────────",
      "",
    ].join("\n"),
  );

  return NextResponse.json({ ok: true });
}
