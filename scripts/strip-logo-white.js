// Remove near-white background from a PNG so only the logo design remains,
// letting the wood-grain show through. Uses Jimp (pure JS, no native deps).
// Usage: node scripts/strip-logo-white.js <input.png> <output.png> [threshold]
const fs = require('fs');
const zlib = require('zlib');

// Minimal PNG reader + writer: decode, zero-alpha near-white pixels, re-encode.
// For the full library route, use `jimp` or `sharp`; this standalone script keeps
// the repo dep-free for a one-off cleanup.
async function main() {
    // Fall back to jimp if available (handles arbitrary PNGs). Otherwise fail loudly.
    let Jimp;
    try {
        const mod = require('jimp');
        Jimp = mod.Jimp || mod.default || mod;
    }
    catch (e) {
        console.error('Need jimp: npm install jimp --no-save');
        process.exit(1);
    }
    const inPath = process.argv[2];
    const outPath = process.argv[3];
    const threshold = parseInt(process.argv[4] || '230', 10);
    if (!inPath || !outPath) {
        console.error('Usage: node scripts/strip-logo-white.js <in> <out> [threshold=230]');
        process.exit(1);
    }

    const img = await Jimp.read(inPath);
    let cleared = 0, total = 0;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
        total++;
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        // Near-white → fully transparent. Also fade slight off-whites proportionally so
        // the edges don't leave a halo.
        if (r >= threshold && g >= threshold && b >= threshold) {
            this.bitmap.data[idx + 3] = 0;
            cleared++;
        } else {
            // Soft fade for edges between threshold and pure-white
            const minC = Math.min(r, g, b);
            if (minC > 200) {
                // 200..threshold: scale alpha from 255 down to 0
                const t = (minC - 200) / (threshold - 200);
                this.bitmap.data[idx + 3] = Math.round(255 * (1 - t));
            }
        }
    });

    // Jimp v1 uses .write(); older used .writeAsync(). Support both.
    if (typeof img.writeAsync === 'function') await img.writeAsync(outPath);
    else await img.write(outPath);
    console.log(`Cleared ${cleared}/${total} white pixels → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
