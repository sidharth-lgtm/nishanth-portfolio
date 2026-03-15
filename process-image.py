"""
Portfolio image processor — Nishanth Krishnan
Resizes, darkens, and adds a bottom vignette to all work card images.

SINGLE FILE:
  python process-image.py <input> <output> [4:5|16:9|21:9]

BATCH ALL (run this once all source images are saved):
  python process-image.py --batch
"""

import sys
import os
from PIL import Image, ImageEnhance, ImageDraw

# ── Target dimensions per ratio ───────────────────────────────────
PRESETS = {
    "4:5":  (800, 1000),   # tall portrait — Card A (Ridley), Card D (HTTYD)
    "16:9": (960, 540),    # landscape     — Card B (Doc), Card C (Alvin)
    "21:9": (1680, 720),   # banner        — Card E (Sonic Boom)
}

# ── Vignette strength per ratio ───────────────────────────────────
VIGNETTE = {
    "4:5":  (0.20, 140),   # bottom 20%, max alpha 140
    "16:9": (0.25, 140),   # bottom 25%, max alpha 140
    "21:9": (0.25, 140),   # bottom 25%, max alpha 140
}

# ── Batch manifest ────────────────────────────────────────────────
BATCH = [
    # (source,              destination,           ratio,  top_bias)
    ("assets/work-ridley.jpg", "assets/work-ridley.jpg", "4:5",  0.25),
    ("assets/work-doc.jpg",    "assets/work-doc.jpg",    "16:9", 0.30),
    ("assets/work-alvin.jpg",  "assets/work-alvin.jpg",  "16:9", 0.30),
    ("assets/work-httyd.jpg",  "assets/work-httyd.jpg",  "4:5",  0.25),
    ("assets/work-sonic.jpg",  "assets/work-sonic.jpg",  "21:9", 0.30),
]


def process(src, dst, ratio="4:5", top_bias=0.25):
    img = Image.open(src).convert("RGB")
    tw, th = PRESETS[ratio]
    sw, sh = img.size

    # Smart crop to target ratio
    target_r = tw / th
    src_r = sw / sh
    if abs(src_r - target_r) > 0.01:
        if src_r > target_r:
            new_w = int(sh * target_r)
            left = (sw - new_w) // 2
            img = img.crop((left, 0, left + new_w, sh))
        else:
            new_h = int(sw / target_r)
            top = int((sh - new_h) * top_bias)
            img = img.crop((0, top, sw, top + new_h))

    img = img.resize((tw, th), Image.LANCZOS)

    # Darken + contrast
    img = ImageEnhance.Brightness(img).enhance(0.80)
    img = ImageEnhance.Contrast(img).enhance(1.12)

    # Bottom vignette
    vig_pct, max_alpha = VIGNETTE[ratio]
    vig_h = int(th * vig_pct)
    vig = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    draw = ImageDraw.Draw(vig)
    for i in range(vig_h):
        alpha = int((i / vig_h) ** 1.5 * max_alpha)
        y = th - vig_h + i
        draw.line([(0, y), (tw, y)], fill=(8, 11, 18, alpha))

    img = img.convert("RGBA")
    img = Image.alpha_composite(img, vig)
    img = img.convert("RGB")

    os.makedirs(os.path.dirname(dst) if os.path.dirname(dst) else ".", exist_ok=True)
    img.save(dst, "JPEG", quality=92, optimize=True)
    kb = os.path.getsize(dst) // 1024
    print(f"  ✓  {dst:<35} {tw}×{th}  {kb} KB")


if __name__ == "__main__":
    args = sys.argv[1:]

    if "--batch" in args:
        print("\nBatch processing all work card images...\n")
        missing = [src for src, *_ in BATCH if not os.path.exists(src)]
        if missing:
            print("⚠  Missing source files (save these first):")
            for f in missing:
                print(f"   • {f}")
            print()
        ok = [(s, d, r, b) for s, d, r, b in BATCH if os.path.exists(s)]
        for src, dst, ratio, bias in ok:
            process(src, dst, ratio, bias)
        print(f"\nDone — {len(ok)}/{len(BATCH)} processed.\n")
        sys.exit(0)

    if len(args) < 2:
        print(__doc__)
        sys.exit(1)

    src   = args[0]
    dst   = args[1]
    ratio = args[2] if len(args) > 2 else "4:5"

    if ratio not in PRESETS:
        print(f"Unknown ratio '{ratio}'. Use: {', '.join(PRESETS)}")
        sys.exit(1)

    if not os.path.exists(src):
        print(f"File not found: {src}")
        sys.exit(1)

    print(f"\n  {src} → {dst}  [{ratio}]")
    process(src, dst, ratio)
    print()
