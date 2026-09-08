import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tingle — Build it. Scan it. Remember it.",
  description:
    "Build words with safe magnetic wooden blocks, scan the arranged letters, and remember them with online sketch cards and personal color cues.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
