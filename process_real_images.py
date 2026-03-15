"""Process all real portfolio images with cinematic treatment."""
from PIL import Image, ImageEnhance, ImageDraw
import os

def vignette(img, pct=0.30, max_a=155, color=(8,11,18)):
    w, h = img.size
    vig_h = int(h * pct)
    vig = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(vig)
    for i in range(vig_h):
        alpha = int((i / vig_h) ** 1.6 * max_a)
        y = h - vig_h + i
        draw.line([(0, y), (w, y)], fill=(*color, alpha))
    top_h = int(h * 0.12)
    for i in range(top_h):
        alpha = int(((top_h - i) / top_h) ** 2 * 80)
        draw.line([(0, i), (w, i)], fill=(*color, alpha))
    out = img.convert("RGBA")
    return Image.alpha_composite(out, vig).convert("RGB")

def smart_crop(img, tw, th, top_bias=0.28):
    w, h = img.size
    tr = tw / th
    sr = w / h
    if abs(sr - tr) > 0.01:
        if sr > tr:
            nw = int(h * tr)
            left = (w - nw) // 2
            img = img.crop((left, 0, left + nw, h))
        else:
            nh = int(w / tr)
            top = int((h - nh) * top_bias)
            img = img.crop((0, top, w, top + nh))
    return img.resize((tw, th), Image.LANCZOS)

def process(src, dst, tw, th, brightness=0.75, contrast=1.15,
            top_bias=0.28, vig_pct=0.30, vig_alpha=155):
    print("  %s -> %s  %dx%d" % (src, dst, tw, th))
    img = Image.open(src).convert("RGB")
    img = smart_crop(img, tw, th, top_bias)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = vignette(img, vig_pct, vig_alpha)
    img.save(dst, "JPEG", quality=93, optimize=True)
    print("    OK  %d KB" % (os.path.getsize(dst) // 1024))

a = "assets/"

process(a+"work-ridley (2).jpg", a+"work-ridley.jpg",  800, 1000, brightness=0.72, top_bias=0.18)
process(a+"work-doc (2).jpg",    a+"work-doc.jpg",     960,  540, brightness=0.74, top_bias=0.30)
process(a+"work-alvin (2).jpg",  a+"work-alvin.jpg",   960,  540, brightness=0.72, top_bias=0.28)
process(a+"work-httyd.jpg",      a+"work-httyd-out.jpg", 800, 1000, brightness=0.70, top_bias=0.22)
process(a+"work-sonic.avif",     a+"work-sonic.jpg",  1680,  720, brightness=0.73, top_bias=0.32, vig_pct=0.28, vig_alpha=150)

process(a+"hero-poster (2).jpg", a+"hero-poster.jpg", 1920, 1080, brightness=0.60, contrast=1.10, top_bias=0.25, vig_pct=0.35, vig_alpha=180)
process(a+"hero-poster (2).jpg", a+"contact-bg.jpg",  1920, 1080, brightness=0.42, contrast=1.08, top_bias=0.25, vig_pct=0.45, vig_alpha=200)

import shutil
shutil.move(a+"work-httyd-out.jpg", a+"work-httyd.jpg")
print("Done.")
