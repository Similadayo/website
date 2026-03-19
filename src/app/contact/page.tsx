"use client";
import styles from "@/components/contact/Contact.module.css";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <section className={styles.heroWrap}>
        <div className="container">
          <div className={styles.heroCentred}>
            <span className="label-tag">Get in touch</span>
            <h1 className={styles.h1}>Have a workflow slowing your team down?</h1>
            <p className={styles.sub}>Let's identify one practical AI use case first. No commitment, no sales pitch.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className={styles.twoCol}>

            {/* Form */}
            <div className={styles.formSide}>
              <h2 className={styles.colH}>Send a message</h2>
              {!submitted ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="name"    className={styles.label}>Name</label>
                      <input type="text"  id="name"  className={styles.input} required placeholder="Your name" />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="email"   className={styles.label}>Email</label>
                      <input type="email" id="email" className={styles.input} required placeholder="you@company.com" />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="company" className={styles.label}>Company</label>
                      <input type="text"  id="company" className={styles.input} required placeholder="Company name" />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="type"    className={styles.label}>Company type</label>
                      <select id="type" className={styles.input}>
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
                    <textarea id="problem" className={styles.textarea} required placeholder="Describe the repetitive task you want to solve..." />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="website" className={styles.label}>Website <span className={styles.optional}>(optional)</span></label>
                    <input type="url" id="website" className={styles.input} placeholder="https://..." />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Submit <ArrowRight size={16}/>
                  </button>
                </form>
              ) : (
                <div className={`card ${styles.successCard}`}>
                  <div className={styles.successIcon}>✓</div>
                  <h3>Got it — we'll be in touch soon.</h3>
                  <p className="text-muted">Alternatively, book a time directly below.</p>
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className={styles.calSide}>
              <h2 className={styles.colH}>Book a time directly</h2>
              <p className="text-muted" style={{ marginBottom: "2rem" }}>Skip the form. Choose a time that works for you.</p>
              <div className={`card ${styles.calPlaceholder}`}>
                <Calendar size={36} style={{ marginBottom: "1rem", color: "var(--fg-subtle)" }}/>
                <p className="text-muted text-sm">Embed Calendly or Cal.com widget here</p>
                <a href="https://cal.com" target="_blank" rel="noreferrer" className="btn-ghost" style={{ marginTop: "1.5rem" }}>
                  Open booking page <ArrowRight size={14}/>
                </a>
              </div>
              <div className={styles.note}>
                <strong>Note:</strong> Initial calls focus on understanding one workflow problem and whether a prototype-first approach fits. Expect 20–30 minutes.
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
