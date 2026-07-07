import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/nav";
import { SiteFooter } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "Brancr Labs — Operational Intelligence Firm",
    template: "%s — Brancr Labs",
  },
  description:
    "Brancr Labs diagnoses and redesigns recurring business workflows before technology is applied — starting with a paid diagnostic, the Workflow Blueprint™, and ending with a fixed-scope Workflow Sprint™.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
