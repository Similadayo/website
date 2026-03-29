import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Brancr Labs | AI Workflow Prototypes for Small Teams",
  description: "Brancr Labs helps recruiting firms, agencies, and small SaaS teams reduce repetitive work with practical, human-in-the-loop AI workflow prototypes.",
  keywords: ["AI workflow", "automation", "recruiting", "agency", "SaaS", "prototype"],
};


import { SiteWrapper } from "@/components/layout/SiteWrapper";
import { AuthProvider } from "@/components/layout/AuthProvider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className="font-sans">
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
