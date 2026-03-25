import type { Metadata } from "next";
import { Inter, Outfit, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter  = Inter ({ subsets: ["latin"], variable: "--font-inter"  });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["400","500","600","700","800"] });

export const metadata: Metadata = {
  title: "Brancr Labs | AI Workflow Prototypes for Small Teams",
  description: "Brancr Labs helps recruiting firms, agencies, and small SaaS teams reduce repetitive work with practical, human-in-the-loop AI workflow prototypes.",
  keywords: ["AI workflow", "automation", "recruiting", "agency", "SaaS", "prototype"],
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head />
      <body className={`${inter.variable} ${outfit.variable}`} style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <ThemeProvider>
          <Navbar />
          <main style={{ flex: 1, paddingTop: "68px" }}>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
