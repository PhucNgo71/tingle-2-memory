import type { Metadata } from "next";
import catalogue from "../../content/words-v1.json";
import TingleWeb, { type TingleWord } from "../../components/TingleWeb";

export const metadata: Metadata = {
  title: "Tingle Web — Build, choose, remember",
  description:
    "Explore 2,000 English words, hear pronunciation, choose a personal color cue, and practice recall with Tingle.",
};

export default function LearnPage() {
  return <TingleWeb words={catalogue.records as TingleWord[]} />;
}
