"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Clock, Mail, User, XCircle } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(false);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("https://formspree.io/f/mpqybpyl", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="site-section">
        <div className="container">
          <div className="site-card p-8 sm:p-12">
            <span className="site-eyebrow">Contact</span>
            <h1 className="site-title mt-5">Have a workflow slowing your team down?</h1>
            <p className="site-subtitle mt-6 max-w-2xl">
              Start with one practical use case. No oversized transformation pitch, just a focused conversation about the repetitive work that is worth fixing.
            </p>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="site-card p-6 sm:p-8">
              <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--site-ink)]">Send a message</h2>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <input type="hidden" name="_replyto" value="contact@brancr.com" />
                  <input type="hidden" name="_subject" value="New inquiry - Brancr Labs" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name">
                      <input type="text" name="name" required placeholder="Your name" className="w-full rounded-[18px] border border-[color:var(--site-border)] bg-white px-4 py-3 text-sm text-[color:var(--site-ink)] outline-none" />
                    </Field>
                    <Field label="Email">
                      <input type="email" name="email" required placeholder="you@company.com" className="w-full rounded-[18px] border border-[color:var(--site-border)] bg-white px-4 py-3 text-sm text-[color:var(--site-ink)] outline-none" />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company">
                      <input type="text" name="company" required placeholder="Company name" className="w-full rounded-[18px] border border-[color:var(--site-border)] bg-white px-4 py-3 text-sm text-[color:var(--site-ink)] outline-none" />
                    </Field>
                    <Field label="Company type">
                      <select name="type" className="w-full rounded-[18px] border border-[color:var(--site-border)] bg-white px-4 py-3 text-sm text-[color:var(--site-ink)] outline-none">
                        <option value="">Select...</option>
                        <option value="agency">Agency</option>
                        <option value="recruiting">Recruiting firm</option>
                        <option value="saas">Small SaaS</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Workflow problem">
                    <textarea name="message" required rows={6} placeholder="Describe the repetitive task you want to solve..." className="w-full rounded-[18px] border border-[color:var(--site-border)] bg-white px-4 py-4 text-sm leading-7 text-[color:var(--site-ink)] outline-none resize-none" />
                  </Field>

                  <Field label="Website (optional)">
                    <input type="url" name="website" placeholder="https://..." className="w-full rounded-[18px] border border-[color:var(--site-border)] bg-white px-4 py-3 text-sm text-[color:var(--site-ink)] outline-none" />
                  </Field>

                  {error && (
                    <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      Something went wrong. Try again or email us directly at contact@brancr.com.
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="site-button">
                    {loading ? "Sending..." : "Submit"}
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <div className="mt-6 site-soft-card p-6">
                  <p className="text-xl font-semibold tracking-tight text-[color:var(--site-ink)]">Got it. We&apos;ll be in touch soon.</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--site-muted)]">You can also email directly or book a conversation using the details on the right.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="site-card p-6 sm:p-8">
                <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--site-ink)]">Talk directly</h2>
                <div className="mt-6 space-y-4">
                  <div className="site-soft-card p-5">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[color:var(--site-accent)]" />
                      <a href="mailto:contact@brancr.com" className="text-sm font-semibold text-[color:var(--site-ink)]">
                        contact@brancr.com
                      </a>
                    </div>
                  </div>
                  <div className="site-soft-card p-5">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[color:var(--site-accent)]" />
                      <p className="text-sm text-[color:var(--site-muted)]">Usually within 1 business day</p>
                    </div>
                  </div>
                  <div className="site-soft-card p-5">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-[color:var(--site-accent)]" />
                      <p className="text-sm text-[color:var(--site-muted)]">You&apos;ll talk to Similoluwa</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="site-card p-6 sm:p-8">
                <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--site-ink)]">Who this is for</h2>
                <div className="mt-6 space-y-3">
                  {[
                    "Teams with 2-30 people doing repetitive ops work",
                    "Recruiting firms, agencies, small SaaS, and consulting teams",
                    "Leaders who want to test a workflow before committing further",
                  ].map((item) => (
                    <div key={item} className="site-soft-card flex items-start gap-3 p-4">
                      <CheckCircle size={16} className="mt-1 text-[color:var(--site-olive)]" />
                      <span className="text-sm leading-7 text-[color:var(--site-muted)]">{item}</span>
                    </div>
                  ))}
                  {[
                    "Enterprise procurement with long vendor cycles",
                    "Teams expecting a full SaaS product immediately",
                  ].map((item) => (
                    <div key={item} className="site-soft-card flex items-start gap-3 p-4">
                      <XCircle size={16} className="mt-1 text-red-500" />
                      <span className="text-sm leading-7 text-[color:var(--site-muted)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--site-soft)]">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
