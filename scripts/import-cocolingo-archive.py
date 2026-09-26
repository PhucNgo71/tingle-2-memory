"""Build the web-ready Cocolingo illustration archive from square PNG art."""

from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE_PATH = ROOT / "content/words-v1.json"
MANIFEST_PATH = ROOT / "content/cocolingo-archive-v1.json"
OUTPUT_DIR = ROOT / "public/archive-images/v1/cards"
PAPER = (255, 250, 242, 255)
SIZE = (480, 480)


def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")
    return slug or "illustration"


def display_name(value: str) -> str:
    label = re.sub(r"[_-]+", " ", value).strip()
    return label[:1].upper() + label[1:]


def main(arguments: list[str]) -> None:
    if len(arguments) != 1:
        raise SystemExit("Usage: python scripts/import-cocolingo-archive.py SOURCE_FOLDER")

    source_dir = Path(arguments[0]).expanduser().resolve()
    if not source_dir.is_dir():
        raise SystemExit(f"Source folder not found: {source_dir}")

    catalogue = json.loads(CATALOGUE_PATH.read_text(encoding="utf-8"))["records"]
    catalogue_by_name: dict[str, list[dict]] = {}
    for word in catalogue:
        catalogue_by_name.setdefault(normalized(word["headword"]), []).append(word)

    sources = sorted(source_dir.glob("*.png"), key=lambda path: path.stem.casefold())
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    records = []
    used_slugs: set[str] = set()

    for index, source_path in enumerate(sources, start=1):
        base_slug = slugify(source_path.stem)
        slug = base_slug
        suffix = 2
        while slug in used_slugs:
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        used_slugs.add(slug)

        output_path = OUTPUT_DIR / f"{slug}.webp"
        with Image.open(source_path) as source:
            rgba = source.convert("RGBA")
            background = Image.new("RGBA", rgba.size, PAPER)
            background.alpha_composite(rgba)
            image = background.convert("RGB")
            image.thumbnail(SIZE, Image.Resampling.LANCZOS)
            image.save(output_path, "WEBP", quality=84, method=6)

        matches = catalogue_by_name.get(normalized(source_path.stem), [])
        word = matches[0] if len(matches) == 1 else None
        records.append(
            {
                "archiveId": f"CCA-{index:04d}",
                "label": display_name(source_path.stem),
                "sourceName": source_path.name,
                "imagePath": f"/archive-images/v1/cards/{slug}.webp",
                "wordId": word["wordId"] if word else None,
            }
        )

    manifest = {
        "schemaVersion": 1,
        "collection": "Cocolingo Illustration Archive",
        "generatedAt": date.today().isoformat(),
        "count": len(records),
        "catalogueMatchCount": sum(record["wordId"] is not None for record in records),
        "records": records,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Imported {manifest['count']} archive illustrations.")
    print(f"Matched {manifest['catalogueMatchCount']} to the Tingle word catalogue.")
    print(MANIFEST_PATH)
    print(OUTPUT_DIR)


if __name__ == "__main__":
    main(sys.argv[1:])
