import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectDir = process.cwd();
const manifestPath = path.join(projectDir, "content", "cocolingo-archive-v1.json");
const cataloguePath = path.join(projectDir, "content", "words-v1.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const catalogue = JSON.parse(await fs.readFile(cataloguePath, "utf8"));
const catalogueIds = new Set(catalogue.records.map((record) => record.wordId));
const errors = [];
const archiveIds = new Set();
const imagePaths = new Set();

if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
if (!Array.isArray(manifest.records) || manifest.records.length !== manifest.count) {
  errors.push("record count does not match manifest count");
}

let linkedCount = 0;
for (const record of manifest.records ?? []) {
  if (!/^CCA-\d{4}$/.test(record.archiveId)) errors.push(`invalid archiveId: ${record.archiveId}`);
  if (archiveIds.has(record.archiveId)) errors.push(`duplicate archiveId: ${record.archiveId}`);
  archiveIds.add(record.archiveId);

  if (!record.label?.trim()) errors.push(`missing label for ${record.archiveId}`);
  if (!record.sourceName?.toLowerCase().endsWith(".png")) errors.push(`invalid source name for ${record.archiveId}`);
  if (!record.imagePath?.startsWith("/archive-images/v1/cards/") || !record.imagePath.endsWith(".webp")) {
    errors.push(`invalid image path for ${record.archiveId}`);
  }
  if (imagePaths.has(record.imagePath)) errors.push(`duplicate image path: ${record.imagePath}`);
  imagePaths.add(record.imagePath);

  try {
    await fs.access(path.join(projectDir, "public", record.imagePath.replace(/^\//, "")));
  } catch {
    errors.push(`missing archive image: ${record.imagePath}`);
  }

  if (record.wordId !== null) {
    linkedCount += 1;
    if (!catalogueIds.has(record.wordId)) errors.push(`unknown catalogue link: ${record.wordId}`);
  }
}

if (linkedCount !== manifest.catalogueMatchCount) {
  errors.push("catalogueMatchCount does not match linked records");
}

if (errors.length) {
  console.error(`Archive validation failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 50)) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Archive valid: ${manifest.count} illustrations; ${linkedCount} catalogue links.`);
}
