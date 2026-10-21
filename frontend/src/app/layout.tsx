import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Katalyst.SMT — Enterprise Infrastructure Resilience & Formal Verification Platform",
  description:
    "Enterprise-grade infrastructure resilience SaaS powered by Z3 SMT theorem proving, spectral graph theory, and Counterexample-Guided Proof-to-Repair synthesis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-indigo-600/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}

