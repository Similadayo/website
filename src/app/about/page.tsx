import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description: "Why Brancr exists, and why we refused to build software first.",
};

export default function About() {
  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">About</p>
        <h1>Most businesses don&apos;t fail from a lack of ambition.</h1>
        <p className="lede">
          They fail from a lack of operational clarity — a tangle of half-documented workflows,
          duplicated effort, and decisions made from memory instead of evidence. That tangle is
          invisible on a balance sheet. It&apos;s where margin, time, and trust quietly die.
        </p>
      </header>

      <section className="block">
        <div className="narrow">
          <p className="prose">
            I&apos;m Similoluwa, and I started Brancr Labs because the standard answers to that
            problem are wrong in opposite directions. Consultants diagnose without building, so
            their insight evaporates in a slide deck. Agencies build without diagnosing, so they
            automate broken processes faster. Software startups guess at problems from a distance
            and spend years searching for the customer they imagined.
          </p>
          <p className="prose mt-lg">
            Brancr occupies the ground all three abandon: research first, implementation second —
            and we only build software for problems we&apos;ve personally solved, repeatedly, for
            paying customers. We have no audience, no capital cushion, no enterprise sales
            machine, and no brand that forgives mistakes. What we have is the ability to know a
            customer&apos;s operational reality better than anyone who hasn&apos;t studied it.
            Evidence is the only asset a firm like this can accumulate for free — and it&apos;s
            the one asset that compounds without permission.
          </p>
          <p className="prose mt-lg">
            Software isn&apos;t the first step, because software built on assumptions is the most
            expensive way to be wrong. Services are how we get paid to discover the truth. When
            the same fix has been sold, delivered, and paid for repeatedly, the software has
            already been validated — writing the code is the final step of a process that began
            with a diagnosis.
          </p>
          <p className="prose mt-lg">
            There are things Brancr refuses to become: a body shop that rents hours, a hype-driven
            AI agency selling technology in search of a problem, a firm that scales delivery by
            degrading quality, or one that chases revenue that teaches it nothing. We will never
            build speculative software, no matter how fashionable the category or how convincing
            the pitch — including our own.
          </p>
          <p className="prose mt-lg">
            Working from Lagos and selling to clients across the US, UK, and EU is not a
            constraint we apologize for. It&apos;s an operating-cost advantage we intend to keep —
            and proof, if this works, that a research-driven firm built with no capital, no
            audience, and no network can win global customers on evidence alone.
          </p>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="page-hero center cta-block">
            <h2 className="h2-cta">See the method, or talk to us directly.</h2>
            <div className="hero-cta">
              <Link href="/methodology" className="btn btn-primary">See the methodology <ArrowRight /></Link>
              <Link href="/contact" className="btn btn-ghost">Contact</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
