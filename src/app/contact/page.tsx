"use client";
import styles from "@/components/contact/Contact.module.css";
import { ArrowRight, Calendar, Mail, Clock } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
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
                  action="https://formspree.io/f/mzzblpkq"
                  method="POST"
                  onSubmit={() => setSubmitted(true)}
                  className={styles.form}
                >
                  {/* Formspree destination */}
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
                  <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Submit <ArrowRight size={16} />
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
                Skip the form. Email us to set up a short call.
              </p>
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
              <div className={styles.note}>
                <strong>Note:</strong> Initial calls focus on understanding one workflow problem
                and whether a prototype-first approach fits. Expect 20–30 minutes.
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
