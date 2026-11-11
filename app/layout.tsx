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
  title: "Tingle — Discover it. Play it. Remember it.",
  description:
    "Learn English in your browser with sketch cards, short vocabulary games, and daily recall.",
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
