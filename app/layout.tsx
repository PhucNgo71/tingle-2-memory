import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Tingle — Build it. Scan it. Remember it.",
  description:
    "Build words with safe magnetic wooden blocks, scan the arranged letters, and remember them with online sketch cards and personal color cues.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={nunito.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
