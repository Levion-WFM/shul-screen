// POST /api/upload-flier
//
// Accepts a base64-encoded JPEG (the data URL produced by backend.html's
// client-side canvas compression), uploads it to Vercel Blob with public
// access, and returns the permanent URL that the kiosk can <img src=...>
// directly without going through Neon.
//
// This is the migration target for fliers: instead of embedding 150-300 KB
// of base64 image data inside the screen_data JSONB row (which gets re-fetched
// on every kiosk poll and burned through Neon's data-transfer quota in days),
// the JSONB row carries only `imageUrl: "https://...vercel-storage.com/..."`
// — kilobytes instead of megabytes — and the actual bytes are served by the
// Blob CDN, browser-cached, and never touch Neon.
//
// Required env var: BLOB_READ_WRITE_TOKEN (auto-provisioned when you connect
// a Blob store to the Vercel project; visible under Storage → Blob).

const { put } = require('@vercel/blob');

// Vercel hobby/pro Blob accepts up to 5 GB per upload, but the admin's
// pre-upload compression caps each flier at 800px / 0.75 quality (~150-300 KB).
// 5 MB is a generous server-side ceiling that catches accidentally-uncompressed
// uploads without rejecting any legitimate flier.
const MAX_BYTES = 5 * 1024 * 1024;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
            error: 'BLOB_READ_WRITE_TOKEN not configured — connect a Vercel Blob store to this project'
        });
    }

    // Auth — same gate as save-data so an unauthenticated POST can't burn
    // Blob storage on someone else's account.
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${adminToken}`) {
            return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
        }
    }

    const body = req.body || {};
    const dataUrl = body.imageData;
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({
            error: 'Body must be { imageData: "data:image/...;base64,..." }'
        });
    }

    // Parse the data URL: "data:<mime>;base64,<payload>"
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx < 0) return res.status(400).json({ error: 'Malformed data URL' });
    const meta = dataUrl.slice(5, commaIdx);    // strip "data:"
    const base64 = dataUrl.slice(commaIdx + 1);
    const semiIdx = meta.indexOf(';');
    const mime = (semiIdx > 0 ? meta.slice(0, semiIdx) : meta) || 'image/jpeg';

    // Reject anything that isn't an image. We won't be hosting arbitrary
    // file types from the admin endpoint — that's a phishing/upload-abuse
    // surface we don't want to grow.
    if (!mime.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image/* uploads are accepted' });
    }

    let bytes;
    try {
        bytes = Buffer.from(base64, 'base64');
    } catch (e) {
        return res.status(400).json({ error: 'Could not decode base64' });
    }
    if (!bytes.length) return res.status(400).json({ error: 'Empty image payload' });
    if (bytes.length > MAX_BYTES) {
        return res.status(413).json({
            error: 'Image too large — compress before uploading (max ' + MAX_BYTES + ' bytes)'
        });
    }

    // Path: fliers/<timestamp>-<random>.<ext>. Putting it under a "fliers/"
    // prefix lets us list/delete fliers as a group later. addRandomSuffix:
    // false because we already include a random suffix and want a stable
    // (predictable, listable) pathname; we don't want Vercel to append more.
    const ext = mime === 'image/png' ? 'png'
              : mime === 'image/webp' ? 'webp'
              : mime === 'image/gif' ? 'gif'
              : 'jpg';
    const random = Math.random().toString(36).slice(2, 10);
    const pathname = 'fliers/' + Date.now() + '-' + random + '.' + ext;

    try {
        const blob = await put(pathname, bytes, {
            access: 'public',
            contentType: mime,
            addRandomSuffix: false,
            // Cache-Control tells the kiosk's browser to cache the image
            // aggressively — admin uploading a new flier mints a new pathname
            // anyway, so there's no cache-busting concern. 30 days here keeps
            // egress essentially zero on repeat polls.
            cacheControlMaxAge: 60 * 60 * 24 * 30
        });
        return res.json({ url: blob.url, pathname: blob.pathname });
    } catch (err) {
        console.error('upload-flier blob put failed:', err);
        return res.status(500).json({ error: 'Upload failed', details: err.message });
    }
};
