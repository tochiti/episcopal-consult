"""Generate the PWA icon set from the existing seal.

Produces:
  - public/icons/icon-192.png         (192x192, gold halo + seal)
  - public/icons/icon-512.png         (512x512)
  - public/icons/icon-maskable-512.png (512x512 with 20% safe zone)
  - public/icons/apple-touch-icon.png (180x180, no transparency)

The seal is centered on a square background of the brand dark wine
colour so the install icon matches the app's chrome.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, 'public', 'logo.png')
OUT = os.path.join(ROOT, 'public', 'icons')
os.makedirs(OUT, exist_ok=True)

# Brand palette — pulled from src/index.css
BG_TOP = (26, 12, 16)        # --bg-2
BG_BOTTOM = (12, 6, 8)       # --bg-3
GOLD = (224, 178, 90)        # --accent


def make_icon(size, maskable=False, apple=False):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # Background — vertical gradient (gold halo at top, brand dark at bottom)
    if apple:
        bg = (26, 12, 16, 255)
    else:
        bg = (0, 0, 0, 0)
    canvas.paste(bg, (0, 0, size, size))
    for y in range(size):
        t = y / size
        r = int(BG_TOP[0] * (1 - t) + BG_BOTTOM[0] * t)
        g = int(BG_TOP[1] * (1 - t) + BG_BOTTOM[1] * t)
        b = int(BG_TOP[2] * (1 - t) + BG_BOTTOM[2] * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Maskable icons need 20% padding on each side (safe zone).
    if maskable:
        inner = int(size * 0.60)
        offset = (size - inner) // 2
    else:
        inner = int(size * 0.72)
        offset = (size - inner) // 2

    # Compose the seal over the background with a soft gold halo.
    seal = Image.open(LOGO).convert('RGBA')
    seal = seal.resize((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(seal, (offset, offset))

    if not apple:
        # Add a soft gold ring just outside the seal — subtle brand mark.
        ring = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        rdraw = ImageDraw.Draw(ring)
        ring_offset = offset - int(size * 0.04)
        ring_size = inner + int(size * 0.08)
        rdraw.ellipse(
            [ring_offset, ring_offset, ring_offset + ring_size, ring_offset + ring_size],
            outline=(GOLD[0], GOLD[1], GOLD[2], 60),
            width=max(1, size // 96),
        )
        ring = ring.filter(ImageFilter.GaussianBlur(radius=size // 96))
        canvas.alpha_composite(ring)

    return canvas.convert('RGB' if apple else 'RGBA')


for name, size, maskable, apple in [
    ('icon-192.png', 192, False, False),
    ('icon-512.png', 512, False, False),
    ('icon-maskable-512.png', 512, True, False),
    ('apple-touch-icon.png', 180, False, True),
]:
    img = make_icon(size, maskable=maskable, apple=apple)
    target = os.path.join(OUT, name)
    img.save(target, 'PNG', optimize=True)
    print(f'wrote {target}  ({size}x{size}, {os.path.getsize(target) // 1024} KB)')
