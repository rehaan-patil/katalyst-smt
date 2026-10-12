import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katalyst.SMT — Infrastructure Resilience & Formal Verification",
  description:
    "Mathematically rigorous infrastructure resilience SaaS with Z3 SMT formal verification and the Proof-to-Repair remediation engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-black text-gray-100 font-sans antialiased selection:bg-purple-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
