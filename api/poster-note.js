const { neon } = require('@neondatabase/serverless');

// One free-text line printed at the bottom of the weekly Shabbos poster,
// inside the cream panel above the address footer. Rendered by
// api/weekly-schedule-pdf.js from zmanim.scheduleNote (populated by
// api/weekly-schedule.js, which reads this table).
//
// Stored in its own single-row table — like campaign_dedications — so a full
// screen_data save from the backend can't clobber it, and so the line is NOT
// tied to a specific Shabbos (it persists across the Sat->Sun rollover until
// the gabbai changes or clears it).
//
//   GET  -> { note: "..." }            (empty string when unset)
//   POST -> { note: "..." } saves it   (full replace; "" clears the line)
//
// Auth: same admin Bearer token as the other write endpoints (ADMIN_TOKEN).

// Keep the line short enough to fit within the poster's borders at a legible
// size — the renderer auto-shrinks to fit width, but a hard cap stops the
// gabbai from pasting a paragraph that would either overflow or render tiny.
const MAX_LEN = 120;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Lazy-create so no migration is needed (same pattern as campaign_dedications).
        await sql`
            CREATE TABLE IF NOT EXISTS poster_note (
                id INT PRIMARY KEY,
                note TEXT NOT NULL DEFAULT '',
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`;

        if (req.method === 'GET') {
            const rows = await sql`SELECT note FROM poster_note WHERE id = 1 LIMIT 1`;
            return res.json({ note: (rows[0] && rows[0].note) || '' });
        }

        if (req.method === 'POST') {
            const adminToken = process.env.ADMIN_TOKEN;
            if (adminToken) {
                const auth = req.headers.authorization;
                if (!auth || auth !== `Bearer ${adminToken}`) {
                    return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
                }
            }

            const body = req.body || {};
            // Single line only: collapse any newlines/runs of whitespace, trim, cap.
            const note = String(body.note == null ? '' : body.note)
                .replace(/[\r\n]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, MAX_LEN);

            await sql`
                INSERT INTO poster_note (id, note, updated_at)
                VALUES (1, ${note}, NOW())
                ON CONFLICT (id) DO UPDATE
                SET note = EXCLUDED.note, updated_at = NOW()
            `;
            return res.json({ success: true, note });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('poster-note error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
