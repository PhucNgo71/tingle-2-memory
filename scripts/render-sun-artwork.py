from pathlib import Path
from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "content/word-images/source/pack-14/TNG-1361.png"
CARD = ROOT / "public/word-images/v1/packs/pack-14/TNG-1361.webp"
THUMBNAIL = ROOT / "public/word-images/v1/packs/pack-14/TNG-1361-thumb.webp"

SCALE = 4
CANVAS = (1600, 1200)
PAPER = "#FFFBF5"
CHARCOAL = "#282520"
PEACH = "#FFC18D"
ORANGE = "#FF9B58"


def scaled(value: int) -> int:
    return value * SCALE


def rounded_line(draw: ImageDraw.ImageDraw, points, fill: str, width: int) -> None:
    scaled_points = [(scaled(x), scaled(y)) for x, y in points]
    scaled_width = scaled(width)
    draw.line(scaled_points, fill=fill, width=scaled_width)
    radius = scaled_width // 2
    for x, y in (scaled_points[0], scaled_points[-1]):
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill)


image = Image.new("RGB", (scaled(CANVAS[0]), scaled(CANVAS[1])), PAPER)
draw = ImageDraw.Draw(image)

center = (800, 540)
shadow_offset = (24, 24)
sun_radius = 220
ray_start = 270
ray_end = 385

# Quiet dashed memory circle from the approved card direction.
outer_radius = 410
for start in range(0, 360, 8):
    draw.arc(
        (
            scaled(center[0] - outer_radius),
            scaled(center[1] - outer_radius),
            scaled(center[0] + outer_radius),
            scaled(center[1] + outer_radius),
        ),
        start=start,
        end=start + 3,
        fill=ORANGE,
        width=scaled(2),
    )

ray_vectors = [
    ((0, -ray_start), (0, -ray_end)),
    ((191, -191), (272, -272)),
    ((ray_start, 0), (ray_end, 0)),
    ((191, 191), (272, 272)),
    ((0, ray_start), (0, ray_end)),
    ((-191, 191), (-272, 272)),
    ((-ray_start, 0), (-ray_end, 0)),
    ((-191, -191), (-272, -272)),
]

for (sx, sy), (ex, ey) in ray_vectors:
    rounded_line(
        draw,
        [
            (center[0] + sx + shadow_offset[0], center[1] + sy + shadow_offset[1]),
            (center[0] + ex + shadow_offset[0], center[1] + ey + shadow_offset[1]),
        ],
        PEACH,
        25,
    )

shadow_center = (center[0] + shadow_offset[0], center[1] + shadow_offset[1])
draw.ellipse(
    (
        scaled(shadow_center[0] - sun_radius),
        scaled(shadow_center[1] - sun_radius),
        scaled(shadow_center[0] + sun_radius),
        scaled(shadow_center[1] + sun_radius),
    ),
    outline=PEACH,
    width=scaled(25),
)

for (sx, sy), (ex, ey) in ray_vectors:
    rounded_line(
        draw,
        [(center[0] + sx, center[1] + sy), (center[0] + ex, center[1] + ey)],
        CHARCOAL,
        25,
    )

draw.ellipse(
    (
        scaled(center[0] - sun_radius),
        scaled(center[1] - sun_radius),
        scaled(center[0] + sun_radius),
        scaled(center[1] + sun_radius),
    ),
    outline=CHARCOAL,
    width=scaled(25),
)

image = image.resize(CANVAS, Image.Resampling.LANCZOS)
MASTER.parent.mkdir(parents=True, exist_ok=True)
CARD.parent.mkdir(parents=True, exist_ok=True)
image.save(MASTER, "PNG", optimize=True)
image.save(CARD, "WEBP", quality=92, method=6)
ImageOps.fit(image, (480, 360), method=Image.Resampling.LANCZOS).save(
    THUMBNAIL, "WEBP", quality=88, method=6
)

print(MASTER)
print(CARD)
print(THUMBNAIL)
