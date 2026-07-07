import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ESSAYS, getEssay } from "@/lib/essays";

export function generateStaticParams() {
  return ESSAYS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssay(slug);
  return { title: essay?.title ?? "Research", description: essay?.dek };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) notFound();

  return (
    <>
      <header className="page-hero container">
        <p className="eyebrow">Research</p>
        <h1>{essay.title}</h1>
        <p className="lede">{essay.dek}</p>
      </header>

      <section className="block">
        <div className="narrow">
          {essay.paragraphs.map((p, i) => (
            <p key={i} className="prose mt-lg">{p}</p>
          ))}
          <Link href="/research" className="btn btn-ghost mt-lg">← Back to Research</Link>
        </div>
      </section>
    </>
  );
}
