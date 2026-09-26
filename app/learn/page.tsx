import type { Metadata } from "next";
import archiveManifest from "../../content/cocolingo-archive-v1.json";
import catalogue from "../../content/words-v1.json";
import imageManifest from "../../public/word-images/v1/manifest.json";
import TingleWeb, { type ArchiveCard, type TingleWord } from "../../components/TingleWeb";

export const metadata: Metadata = {
  title: "Tingle Web — Build, choose, remember",
  description:
    "Explore 2,000 English words, hear pronunciation, choose a personal color cue, and practice recall with Tingle.",
};

export default function LearnPage() {
  const approvedImages = new Map(
    imageManifest.records
      .filter(
        (record) =>
          record.status === "approved" &&
          record.cardPath &&
          record.thumbnailPath &&
          record.checksumSha256,
      )
      .map((record) => [record.wordId, record]),
  );

  const words: TingleWord[] = catalogue.records.map((word) => {
    const image = approvedImages.get(word.wordId);
    if (!image?.cardPath || !image.thumbnailPath || !image.checksumSha256) {
      return {
        ...word,
        imagePath: null,
        thumbnailPath: null,
        imageAlt: null,
        imageStatus: "not_started",
      };
    }

    const version = image.checksumSha256.slice(0, 12);
    return {
      ...word,
      imagePath: `${image.cardPath}?v=${version}`,
      thumbnailPath: `${image.thumbnailPath}?v=${version}`,
      imageAlt: image.alt,
      imageStatus: image.status,
    };
  });

  const archiveCards: ArchiveCard[] = archiveManifest.records;

  return <TingleWeb words={words} archiveCards={archiveCards} />;
}
