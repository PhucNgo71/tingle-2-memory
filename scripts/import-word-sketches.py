"""Import generated sketches into Tingle's versioned word-image store.

Usage:
    python scripts/import-word-sketches.py TNG-0165=C:/path/to/house.png [...]

The importer keeps the original PNG as source art, renders the public card and
thumbnail, and synchronizes the image manifest with the 2,000-word catalogue.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import sys
from datetime import date
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE_PATH = ROOT / "content/words-v1.json"
MANIFEST_PATH = ROOT / "public/word-images/v1/manifest.json"
SOURCE_ROOT = ROOT / "content/word-images/source"
PUBLIC_ROOT = ROOT / "public/word-images/v1/packs"

CARD_SIZE = (1600, 1200)
THUMBNAIL_SIZE = (480, 360)
PAPER = (255, 250, 242)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def prepare_image(source_path: Path) -> Image.Image:
    with Image.open(source_path) as source:
        source.load()
        if source.mode in {"RGBA", "LA"} or "transparency" in source.info:
            rgba = source.convert("RGBA")
            background = Image.new("RGBA", rgba.size, (*PAPER, 255))
            image = Image.alpha_composite(background, rgba).convert("RGB")
        else:
            image = source.convert("RGB")

    return ImageOps.fit(image, CARD_SIZE, method=Image.Resampling.LANCZOS)


def main(arguments: list[str]) -> None:
    if not arguments:
        raise SystemExit("Provide one or more WORD_ID=SOURCE_PNG pairs.")

    catalogue = read_json(CATALOGUE_PATH)
    manifest = read_json(MANIFEST_PATH)
    words = {record["wordId"]: record for record in catalogue["records"]}
    images = {record["wordId"]: record for record in manifest["records"]}
    updated = []

    for argument in arguments:
        word_id, separator, raw_source = argument.partition("=")
        if not separator or not raw_source:
            raise SystemExit(f"Invalid pair: {argument!r}")
        if word_id not in words or word_id not in images:
            raise SystemExit(f"Unknown catalogue ID: {word_id}")

        source_path = Path(raw_source).expanduser().resolve()
        if not source_path.is_file():
            raise SystemExit(f"Source image not found: {source_path}")

        word = words[word_id]
        record = images[word_id]
        pack_name = f"pack-{word['pack']:02d}"
        source_target = SOURCE_ROOT / pack_name / f"{word_id}.png"
        card_target = PUBLIC_ROOT / pack_name / f"{word_id}.webp"
        thumbnail_target = PUBLIC_ROOT / pack_name / f"{word_id}-thumb.webp"

        source_target.parent.mkdir(parents=True, exist_ok=True)
        card_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, source_target)

        card = prepare_image(source_path)
        card.save(card_target, "WEBP", quality=92, method=6)
        ImageOps.fit(card, THUMBNAIL_SIZE, method=Image.Resampling.LANCZOS).save(
            thumbnail_target, "WEBP", quality=88, method=6
        )

        public_card = record["expectedCardPath"]
        public_thumbnail = record["expectedThumbnailPath"]
        checksum = hashlib.sha256(card_target.read_bytes()).hexdigest()

        record.update(
            {
                "status": "approved",
                "alt": f"Minimal charcoal-and-orange line sketch of {word['headword']}.",
                "cardPath": public_card,
                "thumbnailPath": public_thumbnail,
                "checksumSha256": checksum,
                "updatedAt": date.today().isoformat(),
            }
        )
        word.update({"imagePath": public_card, "imageStatus": "approved"})
        updated.append((word_id, word["headword"], pack_name, checksum))

    write_json(CATALOGUE_PATH, catalogue)
    write_json(MANIFEST_PATH, manifest)

    for word_id, headword, pack_name, checksum in updated:
        print(f"{word_id} {headword:<10} {pack_name} {checksum}")


if __name__ == "__main__":
    main(sys.argv[1:])
