// POST /api/upload-template
//
// Stores the thank-you template image as a data URL in a dedicated
// `screen_assets` Neon table (key='thankyou_template'). We avoid the
// kiosk's hot screen_data row so the image bytes don't ride along on
// every 30-second kiosk poll — only thankyou-sender.html fetches it
// (via /api/get-template).
//
// Auth: ADMIN_TOKEN (same as save-data / upload-flier).

const { neon } = require('@neondatabase/serverless');

const MAX_BYTES = 5 * 1024 * 1024;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    // Quick payload-size guard. data: URL is base64, so each byte of payload
    // is ~0.75 bytes of binary. 5 MB binary cap ≈ 6.67 MB string cap; we
    // approximate by checking string length against ~7 MB.
    if (dataUrl.length > Math.ceil(MAX_BYTES * 4 / 3)) {
        return res.status(413).json({ error: 'Image too large (max ~5 MB)' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        await sql`
            CREATE TABLE IF NOT EXISTS screen_assets (
                key         TEXT PRIMARY KEY,
                value       TEXT,
                updated_at  TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        await sql`
            INSERT INTO screen_assets (key, value, updated_at)
            VALUES ('thankyou_template', ${dataUrl}, NOW())
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value, updated_at = NOW()
        `;
        return res.json({ ok: true, bytes: dataUrl.length });
    } catch (err) {
        console.error('upload-template failed:', err);
        return res.status(500).json({ error: 'Upload failed', details: err.message });
    }
};
