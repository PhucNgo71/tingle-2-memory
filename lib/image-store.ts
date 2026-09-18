export const IMAGE_STORE_VERSION = 1 as const;
export const IMAGE_STORE_BASE_PATH = `/word-images/v${IMAGE_STORE_VERSION}`;

export type WordImageStatus =
  | "not_started"
  | "draft"
  | "in_review"
  | "approved"
  | "retired";

export interface WordImageRecord {
  wordId: string;
  headword: string;
  rank: number;
  pack: number;
  status: WordImageStatus;
  alt: string;
  cardPath: string | null;
  thumbnailPath: string | null;
  expectedCardPath: string;
  expectedThumbnailPath: string;
  checksumSha256: string | null;
  updatedAt: string | null;
}

export interface WordImageManifest {
  schemaVersion: 1;
  contentVersion: number;
  coreWordCount: 2000;
  imageStrategy: "neutral-sketch-with-app-color-overlay";
  records: WordImageRecord[];
}

export function getWordImagePack(rank: number): number {
  if (!Number.isInteger(rank) || rank < 1 || rank > 2000) {
    throw new RangeError("Word rank must be an integer from 1 to 2000.");
  }
  return Math.floor((rank - 1) / 100) + 1;
}

export function getExpectedWordImagePaths(wordId: string, rank: number) {
  const pack = String(getWordImagePack(rank)).padStart(2, "0");
  const base = `${IMAGE_STORE_BASE_PATH}/packs/pack-${pack}/${wordId}`;
  return {
    card: `${base}.webp`,
    thumbnail: `${base}-thumb.webp`,
  };
}

export async function loadWordImageManifest(
  fetcher: typeof fetch = fetch,
): Promise<WordImageManifest> {
  const response = await fetcher(`${IMAGE_STORE_BASE_PATH}/manifest.json`);
  if (!response.ok) {
    throw new Error(`Unable to load Tingle image manifest (${response.status}).`);
  }
  return (await response.json()) as WordImageManifest;
}

