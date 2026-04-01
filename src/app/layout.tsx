import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { getCachedAuth } from "@/auth";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://labs.brancr.com"),
  title: {
    template: "%s | Brancr Labs",
    default: "Brancr Labs | AI Workflow Prototypes for Small Teams",
  },
  description: "Brancr Labs builds practical AI workflow automation and prototypes for recruiting firms, agencies, and small SaaS teams to eliminate repetitive tasks.",
  keywords: [
    "AI workflow automation for recruiting firms",
    "AI workflow prototypes for agencies",
    "practical AI workflows for small teams",
    "AI automation for repetitive admin work",
    "Brancr Labs"
  ],
  openGraph: {
    title: "Brancr Labs | Practical AI Workflow Automation",
    description: "AI workflow prototypes for recruiting firms, agencies, and small SaaS teams.",
    url: "https://labs.brancr.com",
    siteName: "Brancr Labs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brancr Labs | AI Workflow Automation",
    description: "Practical AI workflows and prototypes for recruiting firms and small teams.",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};


import { SiteWrapper } from "@/components/layout/SiteWrapper";
import { AuthProvider } from "@/components/layout/AuthProvider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getCachedAuth()

  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} font-sans`}
    >
      <head />
      <body style={{ minHeight: "100vh" }}>
        <AuthProvider session={session}>
          <ThemeProvider>
            <SiteWrapper>
              {children}
            </SiteWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
