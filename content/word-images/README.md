# Tingle word-image store

This directory defines the production workflow for the 2,000 Phase 1 sketch memory-card images.

## Storage model

- `source/pack-XX/TNG-####.png` — editable or lossless production master.
- `public/word-images/v1/packs/pack-XX/TNG-####.webp` — approved card image delivered to the app.
- `public/word-images/v1/packs/pack-XX/TNG-####-thumb.webp` — approved lightweight thumbnail.
- `public/word-images/v1/manifest.json` — searchable metadata and production status for all 2,000 words.
- `public/word-images/v1/manifest.schema.json` — machine-readable contract for the manifest.

The repository stores files by stable Tingle word ID. A headword may be edited without breaking an app reference.

## Runtime integration

`public/word-images/v1/manifest.json` is the source of truth for artwork shown in Tingle Web. The `/learn` page joins manifest records to the word catalogue by `wordId` at build time and exposes artwork only when the manifest status is `approved` and both files and a checksum are present. The checksum is added to the image URL as a cache version, so replacing approved artwork cannot leave an older image or letter placeholder in the browser.

The validation command also verifies that catalogue identity, rank, pack, approval status, and public image path agree with the manifest.

## Visual rule

Each word has one calm, neutral sketch master. Do not create seven image copies for the seven memory colors. The learner-selected color cue is applied by the app as a separate interface layer, so the original sketch remains reusable and visually quiet.

## Production states

`not_started` → `draft` → `in_review` → `approved`

Only an `approved` record may expose `cardPath` and `thumbnailPath`. Draft source images stay outside `public/` and are not shipped to learners.

## Recommended image specification

- Card: WebP, 1600 × 1200 px, 4:3, sRGB.
- Thumbnail: WebP, 480 × 360 px, 4:3, sRGB.
- Style: minimal line drawing, one focal idea, no embedded word label, no baked-in color cue.
- Accessibility: every approved record needs concise alt text.
- Integrity: set the SHA-256 checksum when the image is approved.

Run `pnpm validate:image-store` before publishing image updates.
