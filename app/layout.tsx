import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tingle — Scan it. Learn it. Remember it.",
  description:
    "Tingle turns sketch book pages into personal AI-powered memory cards for English learning.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
