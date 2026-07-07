import type { Metadata } from "next";
import Link from "next/link";
import { ESSAYS } from "@/lib/essays";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Research",
  description: "Brancr's published research — evidence and reasoning, not general-purpose content marketing.",
};

export default function Research() {
  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">Research</p>
        <h1>What we've learned diagnosing operational workflows.</h1>
        <p className="lede">
          Not a blog. This is where findings that could plausibly inform a real diagnosis get
          published — evidence and reasoning, not content marketing.
        </p>
      </header>

      <section className="block">
        <div className="container">
          <div className="grid-2">
            {ESSAYS.map((e) => (
              <Link key={e.slug} href={`/research/${e.slug}`} className="card">
                <h3>{e.title}</h3>
                <p>{e.dek}</p>
                <span className="btn btn-ghost mt-md">
                  Read <ArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
