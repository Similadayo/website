"use client";

import { useState } from "react";

// Qualifying contact form — per Brand Book Ch.12: not a generic "tell us about
// your project" box. Every field here starts the discovery process.
export default function Contact() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", company: "", workflow: "", volume: "", owner: "", tools: "", problem: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <>
        <header className="page-hero container center">
          <p className="eyebrow">Contact</p>
          <h1>Thanks. We&apos;ll be in touch.</h1>
          <p className="lede">
            We read every submission ourselves. If there&apos;s a real fit, you&apos;ll hear back
            with specific next steps, not a generic reply.
          </p>
        </header>
      </>
    );
  }

  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">Contact</p>
        <h1>Tell us about the workflow, not the project.</h1>
        <p className="lede">
          The more specific you are here, the faster we can tell you honestly whether this is a
          fit, before either of us spends time on a call that shouldn&apos;t happen.
        </p>
      </header>

      <section className="block">
        <div className="narrow">
          <form className="card card-lg" onSubmit={onSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Your name *</label>
                <input id="name" required value={form.name} onChange={set("name")} />
              </div>
              <div className="field">
                <label htmlFor="email">Work email *</label>
                <input id="email" type="email" required value={form.email} onChange={set("email")} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="company">Company *</label>
              <input id="company" required value={form.company} onChange={set("company")} />
            </div>
            <div className="field">
              <label htmlFor="workflow">Which workflow is costing you the most? *</label>
              <input id="workflow" required placeholder="e.g. client onboarding" value={form.workflow} onChange={set("workflow")} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="volume">How often does it run?</label>
                <input id="volume" placeholder="e.g. 15 new clients/month" value={form.volume} onChange={set("volume")} />
              </div>
              <div className="field">
                <label htmlFor="owner">Who owns it internally?</label>
                <input id="owner" placeholder="Name or role" value={form.owner} onChange={set("owner")} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="tools">What tools are involved?</label>
              <input id="tools" placeholder="e.g. Stripe, Trello, Slack" value={form.tools} onChange={set("tools")} />
            </div>
            <div className="field">
              <label htmlFor="problem">What&apos;s actually going wrong?</label>
              <textarea id="problem" rows={4} value={form.problem} onChange={set("problem")} />
            </div>

            {error && <p className="prose num-before">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
