import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/nav";
import { SiteFooter } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://labs.brancr.com"),
  alternates: { canonical: "/" },
  title: {
    default: "Brancr Labs · Operational Intelligence Firm",
    template: "%s · Brancr Labs",
  },
  description:
    "Brancr Labs is an Operational Intelligence firm. We diagnose and rebuild the recurring workflows a business runs on, before a line of software is written. It starts with a paid Workflow Blueprint™ and, only if it's worth it, a fixed-scope Workflow Sprint™.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body>
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
