import { Jimp } from 'jimp';

const SIZES = [192, 512];
const BG = 0x1a1a1aff;
const WHITE = 0xffffffff;
const GREEN = 0x16a34aff;

function setPixel(img, x, y, color, size) {
  if (x >= 0 && x < size && y >= 0 && y < size) {
    img.setPixelColor(color, x, y);
  }
}

function fillCircle(img, cx, cy, r, color, size) {
  for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) {
        setPixel(img, x, y, color, size);
      }
    }
  }
}

function fillRect(img, x1, y1, w, h, color, size) {
  for (let x = x1; x < x1 + w; x++) {
    for (let y = y1; y < y1 + h; y++) {
      setPixel(img, x, y, color, size);
    }
  }
}

function fillTriangle(img, x1, y1, x2, y2, x3, y3, color, size) {
  const minX = Math.floor(Math.min(x1, x2, x3));
  const maxX = Math.ceil(Math.max(x1, x2, x3));
  const minY = Math.floor(Math.min(y1, y2, y3));
  const maxY = Math.ceil(Math.max(y1, y2, y3));
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
      const d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3);
      const d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1);
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(hasNeg && hasPos)) setPixel(img, x, y, color, size);
    }
  }
}

for (const size of SIZES) {
  const img = new Jimp({ width: size, height: size, color: BG });

  const s = size / 512;

  // Pole
  fillRect(img, Math.round(244 * s), Math.round(130 * s), Math.round(16 * s), Math.round(210 * s), WHITE, size);

  // Flag (triangle)
  fillTriangle(
    img,
    Math.round(260 * s), Math.round(130 * s),
    Math.round(360 * s), Math.round(175 * s),
    Math.round(260 * s), Math.round(220 * s),
    GREEN, size
  );

  // Ball
  fillCircle(img, Math.round(216 * s), Math.round(370 * s), Math.round(58 * s), WHITE, size);

  // Ground line (semi-transparent — draw at 35% opacity by blending)
  const gx = Math.round(110 * s);
  const gy = Math.round(418 * s);
  const gw = Math.round(292 * s);
  const gh = Math.max(2, Math.round(14 * s));
  for (let x = gx; x < gx + gw; x++) {
    for (let y = gy; y < gy + gh; y++) {
      setPixel(img, x, y, 0x666666ff, size);
    }
  }

  const outPath = `public/pwa-${size}x${size}.png`;
  await img.write(outPath);
  console.log(`Generated ${outPath}`);
}
