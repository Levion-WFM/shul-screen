// One-shot script to generate a "blank" version of the weekly schedule
// template by masking the existing zmanim text regions with a tiled parchment
// sample pulled from a clean area of the same image.
//
// Usage:  node weekly-schedule/mask-template.mjs
// Input:  weekly-schedule/template.png
// Output: weekly-schedule/template-blank.png
//
// The coordinates below are hand-tuned for the 1024x1536 template. If you
// replace the template with a different aspect ratio, re-tune.

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT = path.join(__dirname, 'template.png');
const OUTPUT = path.join(__dirname, 'template-blank.png');

// Where to pull a clean parchment sample from (no text, no dots).
// Top margin of the parchment panel — above the "parasha" header.
const SAMPLE = { left: 330, top: 380, width: 140, height: 55 };

// Regions to mask (cover the existing text). Coordinates are in source pixels
// against the 1024x1536 original. Tuned to fully cover every printed glyph.
const MASK_REGIONS = [
  // "זמנים לטבת קודש פרשת [parasha]" header line
  { name: 'parasha',        left: 180, top: 430, width: 680, height: 95 },
  // Erev shabbos: candles / plag / mincha erev (3 lines, incl. numbers)
  { name: 'erev-shabbos',   left: 180, top: 520, width: 680, height: 195 },
  // Shiur box contents — inner text only; keep the ornamental border frame
  { name: 'shiur-interior', left: 255, top: 745, width: 520, height: 160 },
  // Shabbos times — shacharis through maariv (5 lines)
  { name: 'shabbos-times',  left: 180, top: 945, width: 680, height: 260 },
  // Footer note "לא בריישבת אבא" (address stays — it's on a separate line)
  { name: 'footer-note',    left: 340, top: 1255, width: 350, height: 70 }
];

async function main() {
  const source = sharp(INPUT);
  const meta = await source.metadata();
  console.log(`Source: ${meta.width}x${meta.height} ${meta.format}`);

  // Sample the MEAN parchment color from a small safe area (right margin
  // of the parchment panel — past where Hebrew text ends). Using mean keeps
  // the color accurate even if the sample picks up a couple of dot pixels.
  const stats = await sharp(INPUT)
    .extract({ left: 830, top: 500, width: 40, height: 200 })
    .stats();
  const [r, g, b] = stats.channels.map((c) => Math.round(c.mean));
  console.log(`Parchment mean color: rgb(${r}, ${g}, ${b})`);

  // Build mask rectangles as a flat solid fill of the mean parchment color.
  // HTML text overlaid on top hides any texture mismatch — and the mask is
  // only visible when the download-as-PNG image is viewed at extreme zoom.
  const composites = [];
  for (const reg of MASK_REGIONS) {
    const rect = await sharp({
      create: {
        width: reg.width,
        height: reg.height,
        channels: 3,
        background: { r, g, b }
      }
    })
      .blur(1.2)       // soften the edges so the patch blends better
      .png()
      .toBuffer();

    composites.push({ input: rect, top: reg.top, left: reg.left });
    console.log(`Masking ${reg.name} at ${reg.left},${reg.top} (${reg.width}x${reg.height})`);
  }

  // Composite all mask rectangles onto the original, then save.
  await sharp(INPUT)
    .composite(composites)
    .png()
    .toFile(OUTPUT);

  console.log(`\nWrote ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
