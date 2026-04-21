// Crop a transparent PNG to the bounding box of its non-transparent content,
// killing the empty padding around the actual design. Writes back to outPath.
// Usage: node scripts/crop-logo.js <in.png> <out.png> [alphaMin=10]
const mod = require('jimp');
const Jimp = mod.Jimp || mod.default || mod;

async function main() {
    const inPath = process.argv[2];
    const outPath = process.argv[3];
    const alphaMin = parseInt(process.argv[4] || '10', 10);
    if (!inPath || !outPath) {
        console.error('Usage: node crop-logo.js <in> <out> [alphaMin]');
        process.exit(1);
    }

    const img = await Jimp.read(inPath);
    const { width: w, height: h, data } = img.bitmap;

    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const a = data[(y * w + x) * 4 + 3];
            if (a >= alphaMin) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    if (maxX < 0) { console.error('No visible pixels.'); process.exit(1); }

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    console.log(`Source: ${w}x${h}  crop box: ${minX},${minY} → ${maxX},${maxY}  out: ${cropW}x${cropH}`);

    // Jimp v1 crop signature differs — try both
    const cropped = (typeof img.crop === 'function' && img.crop.length === 1)
        ? img.crop({ x: minX, y: minY, w: cropW, h: cropH })
        : img.crop(minX, minY, cropW, cropH);

    if (typeof cropped.writeAsync === 'function') await cropped.writeAsync(outPath);
    else await cropped.write(outPath);
    console.log('→', outPath);
}

main().catch(e => { console.error(e); process.exit(1); });
