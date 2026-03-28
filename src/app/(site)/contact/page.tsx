"use client";
import styles from "@/components/contact/Contact.module.css";
import { ArrowRight, Calendar, Mail, Clock, CheckCircle, User, Zap, XCircle } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("https://formspree.io/f/mpqybpyl", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch (err: any) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>{" "}
      {/* ── HERO ── */}
      <section className={styles.heroWrap}>
        <div className="container">
          <div className={styles.heroCentred}>
            <span className="label-tag">Get in touch</span>
            <h1 className={styles.h1}>Have a workflow slowing your team down?</h1>
            <p className={styles.sub}>Let's identify one practical AI use case first. No commitment, no sales pitch.</p>
          </div>
        </div>
      </section>

      {/* ── FORM + CALENDAR ── */}
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className={styles.twoCol}>

            {/* ── Contact form → sends to contact@brancr.com via Formspree ── */}
            <div className={styles.formSide}>
              <h2 className={styles.colH}>Send a message</h2>
              {!submitted ? (
                <form
                  onSubmit={handleSubmit}
                  className={styles.form}
                >
                  {/* Formspree destination note: the ID is in the fetch call above */}
                  <input type="hidden" name="_replyto" value="contact@brancr.com" />
                  <input type="hidden" name="_subject" value="New inquiry — Brancr Labs" />

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="name"  className={styles.label}>Name</label>
                      <input type="text"  id="name"  name="name"  className={styles.input} required placeholder="Your name" />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="email" className={styles.label}>Email</label>
                      <input type="email" id="email" name="email" className={styles.input} required placeholder="you@company.com" />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="company" className={styles.label}>Company</label>
                      <input type="text" id="company" name="company" className={styles.input} required placeholder="Company name" />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="type" className={styles.label}>Company type</label>
                      <select id="type" name="type" className={styles.select}>
                        <option value="">Select...</option>
                        <option value="agency">Agency</option>
                        <option value="recruiting">Recruiting firm</option>
                        <option value="saas">Small SaaS</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="problem" className={styles.label}>Workflow problem</label>
                    <textarea id="problem" name="message" className={styles.textarea} required placeholder="Describe the repetitive task you want to solve..." />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="website" className={styles.label}>Website <span className={styles.optional}>(optional)</span></label>
                    <input type="url" id="website" name="website" className={styles.input} placeholder="https://..." />
                  </div>

                  {error && (
                    <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
                      Something went wrong. Please try again or email us directly at contact@brancr.com.
                    </p>
                  )}

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading}
                    style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Sending..." : "Submit"} <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <div className={`card ${styles.successCard}`}>
                  <div className={styles.successIcon}>✓</div>
                  <h3>Got it — we'll be in touch soon.</h3>
                  <p className="text-muted">Alternatively, book a time directly to the right.</p>
                </div>
              )}
            </div>

            {/* ── Book a call card ── */}
            <div className={styles.calSide}>
              <h2 className={styles.colH}>Book a time directly</h2>
              <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
                Skip the form and reach out directly.
              </p>

              {/* Email + response time */}
              <div className={`card ${styles.emailCard}`}>
                <div className={styles.emailRow}>
                  <div className={styles.emailIconWrap}><Mail size={18} /></div>
                  <div>
                    <div className={styles.emailLabel}>Business email</div>
                    <a href="mailto:contact@brancr.com" className={styles.emailAddr}>contact@brancr.com</a>
                  </div>
                </div>
                <div className={styles.emailMeta}>
                  <span className={styles.bookChip}><Clock size={12} /> Usually within 1 business day</span>
                  <span className={styles.bookChip}><User size={12} /> You'll talk to Similoluwa</span>
                </div>
              </div>

              {/* Discovery call block */}
              <div className={`card ${styles.bookCard}`}>
                <div className={styles.bookIcon}><Calendar size={28} /></div>
                <h3 className={styles.bookTitle}>Discovery call</h3>
                <p className={styles.bookDesc}>
                  A focused 20–30 minute conversation to understand your workflow and whether a prototype-first approach is a fit.
                </p>
                <div className={styles.bookMeta}>
                  <span className={styles.bookChip}><Clock size={12} /> 20–30 min</span>
                  <span className={styles.bookChip}><Mail size={12} /> Video or phone</span>
                </div>
                <a
                  href="mailto:contact@brancr.com?subject=Discovery call request&body=Hi, I'd like to book a discovery call."
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: "1.5rem" }}
                >
                  Email to book <ArrowRight size={16} />
                </a>
              </div>

              {/* What happens next */}
              <div className={styles.nextSteps}>
                <div className={styles.nextStepsLabel}>What happens after you submit</div>
                {[
                  { icon: <CheckCircle size={13} />, text: "We review your workflow problem (within 1 business day)" },
                  { icon: <Mail size={13} />, text: "You get a short reply with questions or a proposed call time" },
                  { icon: <Zap size={13} />, text: "If there's a fit, we outline a lightweight prototype scope" },
                ].map((step, i) => (
                  <div key={i} className={styles.nextStep}>
                    <span className={styles.nextStepIcon}>{step.icon}</span>
                    <span className={styles.nextStepText}>{step.text}</span>
                  </div>
                ))}
              </div>

              {/* Best for / Not for */}
              <div className={styles.qualifier}>
                <div className={styles.qualRow}>
                  <div className={styles.qualTitle}>Best for</div>
                  {[
                    "Teams with 2–30 people doing repetitive ops work",
                    "Agencies, recruiting firms, small SaaS, consulting",
                    "Leaders open to testing before committing",
                  ].map((t) => (
                    <div key={t} className={styles.qualItem}><CheckCircle size={12} className={styles.qualGreen} />{t}</div>
                  ))}
                </div>
                <div className={styles.qualDivider} />
                <div className={styles.qualRow}>
                  <div className={styles.qualTitle}>Not for</div>
                  {[
                    "Enterprise procurement with long vendor cycles",
                    "Teams wanting a fully-built, deployed SaaS product",
                  ].map((t) => (
                    <div key={t} className={styles.qualItem}><XCircle size={12} className={styles.qualRed} />{t}</div>
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
