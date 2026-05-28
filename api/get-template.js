// GET /api/get-template
//
// Returns the current thank-you template as { imageData: "data:image/..." }
// from the screen_assets Neon table. Public — no auth — because the
// resulting image is sent in outbound emails anyway, there's no secrecy.
// Kept on a dedicated endpoint (not lumped into /api/get-data) so the
// kiosk's hot-poll payload stays kilobyte-sized.

const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=60');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not configured' });

    try {
        const sql = neon(process.env.DATABASE_URL);
        // Don't error out if the table hasn't been created yet — that just
        // means no template has been pushed yet. Return null cleanly.
        await sql`
            CREATE TABLE IF NOT EXISTS screen_assets (
                key         TEXT PRIMARY KEY,
                value       TEXT,
                updated_at  TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        const rows = await sql`SELECT value, updated_at FROM screen_assets WHERE key = 'thankyou_template' LIMIT 1`;
        if (!rows.length) return res.status(200).json({ imageData: null });
        return res.status(200).json({
            imageData: rows[0].value,
            updatedAt: rows[0].updated_at
        });
    } catch (err) {
        console.error('get-template failed:', err);
        return res.status(500).json({ error: 'Read failed', details: err.message });
    }
};
