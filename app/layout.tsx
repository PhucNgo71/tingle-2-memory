import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tingle — Build it. Choose it. Remember it.",
  description:
    "Tingle connects safe wooden word building with online sketch memory cards and personalized color cues.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
