import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectDir = process.cwd();
const storeDir = path.join(projectDir, "public", "word-images", "v1");
const manifestPath = path.join(storeDir, "manifest.json");
const allowedStatuses = new Set(["not_started", "draft", "in_review", "approved", "retired"]);

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const errors = [];

if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
if (manifest.coreWordCount !== 2000) errors.push("coreWordCount must be 2000");
if (!Array.isArray(manifest.records) || manifest.records.length !== 2000) {
  errors.push("manifest must contain exactly 2,000 records");
}

const ids = new Set();
const ranks = new Set();
const packCounts = new Map();

for (const record of manifest.records ?? []) {
  if (!/^TNG-\d{4}$/.test(record.wordId)) errors.push(`invalid wordId: ${record.wordId}`);
  if (ids.has(record.wordId)) errors.push(`duplicate wordId: ${record.wordId}`);
  ids.add(record.wordId);

  if (!Number.isInteger(record.rank) || record.rank < 1 || record.rank > 2000) {
    errors.push(`invalid rank for ${record.wordId}`);
  }
  if (ranks.has(record.rank)) errors.push(`duplicate rank: ${record.rank}`);
  ranks.add(record.rank);

  const expectedPack = Math.floor((record.rank - 1) / 100) + 1;
  if (record.pack !== expectedPack) errors.push(`incorrect pack for ${record.wordId}`);
  packCounts.set(record.pack, (packCounts.get(record.pack) ?? 0) + 1);

  if (!allowedStatuses.has(record.status)) errors.push(`invalid status for ${record.wordId}`);
  if (!record.alt?.trim()) errors.push(`missing alt text for ${record.wordId}`);

  const pack = String(record.pack).padStart(2, "0");
  const expectedCard = `/word-images/v1/packs/pack-${pack}/${record.wordId}.webp`;
  const expectedThumb = `/word-images/v1/packs/pack-${pack}/${record.wordId}-thumb.webp`;
  if (record.expectedCardPath !== expectedCard) errors.push(`incorrect expectedCardPath for ${record.wordId}`);
  if (record.expectedThumbnailPath !== expectedThumb) errors.push(`incorrect expectedThumbnailPath for ${record.wordId}`);

  if (record.status === "approved") {
    if (record.cardPath !== expectedCard || record.thumbnailPath !== expectedThumb) {
      errors.push(`approved paths missing for ${record.wordId}`);
    } else {
      for (const publicPath of [record.cardPath, record.thumbnailPath]) {
        try {
          await fs.access(path.join(projectDir, "public", publicPath.replace(/^\//, "")));
        } catch {
          errors.push(`approved asset missing: ${publicPath}`);
        }
      }
    }
    if (!/^[a-f0-9]{64}$/.test(record.checksumSha256 ?? "")) {
      errors.push(`approved checksum missing for ${record.wordId}`);
    }
  } else if (record.cardPath !== null || record.thumbnailPath !== null) {
    errors.push(`non-approved record exposes a public asset: ${record.wordId}`);
  }
}

for (let pack = 1; pack <= 20; pack += 1) {
  if (packCounts.get(pack) !== 100) errors.push(`pack ${pack} must contain 100 records`);
}

if (errors.length) {
  console.error(`Image store validation failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 50)) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Image store valid: 2,000 records across 20 packs; approved assets verified.");
}

