// POST /api/upload-template
//
// Accepts a base64-encoded image and saves it as the shared default
// thank-you template:
//   1. uploads the bytes to Vercel Blob (under templates/thankyou.<ext>)
//   2. writes the resulting URL into screen_data.data.thankyouTemplateUrl
//   3. returns { url }
//
// /api/get-data already serves data.thankyouTemplateUrl as part of its
// JSON response (see merge below in get-data.js), so any visitor to
// /thankyou-sender.html can pull the current template without auth.
//
// Auth: same Bearer ADMIN_TOKEN pattern as upload-flier and save-data —
// only the admin can change what template everyone uses.
//
// Env: BLOB_READ_WRITE_TOKEN, DATABASE_URL, ADMIN_TOKEN (optional but
// recommended).

const { put } = require('@vercel/blob');
const { neon } = require('@neondatabase/serverless');

const MAX_BYTES = 5 * 1024 * 1024;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });
    }
    if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization || '';
        if (auth !== 'Bearer ' + adminToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    const body = req.body || {};
    const dataUrl = body.imageData;
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Body must be { imageData: "data:image/...;base64,..." }' });
    }

    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx < 0) return res.status(400).json({ error: 'Malformed data URL' });
    const meta = dataUrl.slice(5, commaIdx);
    const base64 = dataUrl.slice(commaIdx + 1);
    const semiIdx = meta.indexOf(';');
    const mime = (semiIdx > 0 ? meta.slice(0, semiIdx) : meta) || 'image/jpeg';
    if (!mime.startsWith('image/')) return res.status(400).json({ error: 'Only image/* uploads accepted' });

    let bytes;
    try { bytes = Buffer.from(base64, 'base64'); }
    catch (e) { return res.status(400).json({ error: 'Could not decode base64' }); }
    if (!bytes.length)             return res.status(400).json({ error: 'Empty image payload' });
    if (bytes.length > MAX_BYTES)  return res.status(413).json({ error: 'Image too large (max 5 MB)' });

    const ext = mime === 'image/png' ? 'png'
              : mime === 'image/webp' ? 'webp'
              : mime === 'image/gif' ? 'gif'
              : 'jpg';

    // New random suffix on every upload so Blob doesn't refuse a re-upload of
    // the same pathname AND so the URL changes — pages that cached the old
    // URL via Cache-Control will pick up the new one on next page load.
    const random = Math.random().toString(36).slice(2, 10);
    const pathname = 'templates/thankyou-' + Date.now() + '-' + random + '.' + ext;

    try {
        const blob = await put(pathname, bytes, {
            access: 'public',
            contentType: mime,
            addRandomSuffix: false,
            cacheControlMaxAge: 60 * 60 * 24 * 30
        });

        // Persist the URL into the shared screen_data JSONB so /api/get-data
        // serves it to all clients.
        const sql = neon(process.env.DATABASE_URL);
        await sql`CREATE TABLE IF NOT EXISTS screen_data (id INT PRIMARY KEY, data JSONB)`;
        var rows = await sql`SELECT data FROM screen_data WHERE id = 1`;
        var data = (rows.length > 0 && rows[0].data) ? rows[0].data : {};
        data.thankyouTemplateUrl = blob.url;
        await sql`
            INSERT INTO screen_data (id, data) VALUES (1, ${JSON.stringify(data)})
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
        `;

        return res.json({ url: blob.url, pathname: blob.pathname });
    } catch (err) {
        console.error('upload-template failed:', err);
        return res.status(500).json({ error: 'Upload failed', details: err.message });
    }
};
