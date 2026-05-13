import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AccessibilityRoot } from "@/components/accessibility-root";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Civix. — Civic Micro-Task Platform",
  description:
    "Transform civic engagement into quick, accessible micro-actions. Pick up a nearby task, upload verified information, and see immediate impact in your community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        >
          <AccessibilityRoot />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
