// Returns which donation_keys have already had a thank-you sent.
//
// POST { keys: ["key1", "key2", ...] }
// →    { sent: ["key1", ...] }     (subset of input that's already in the log)
//
// First call also auto-creates the donation_log table so we don't need a
// separate migration step.

const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not set' });

    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};
    var keys = Array.isArray(body.keys) ? body.keys.map(String) : [];
    if (!keys.length) return res.status(200).json({ sent: [] });

    try {
        var sql = neon(process.env.DATABASE_URL);

        // Idempotent table create — first hit per cold start creates it; subsequent
        // calls are a no-op. Keeps deploys zero-migration.
        await sql`
            CREATE TABLE IF NOT EXISTS donation_log (
                donation_key   TEXT PRIMARY KEY,
                team_id        TEXT,
                team_name      TEXT,
                amount         NUMERIC,
                recipient      TEXT,
                sent_at        TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        var rows = await sql`
            SELECT donation_key, sent_at
            FROM donation_log
            WHERE donation_key = ANY(${keys})
        `;
        var sent = rows.map(function(r) {
            return { key: r.donation_key, sentAt: r.sent_at };
        });
        return res.status(200).json({ sent: sent });
    } catch (e) {
        return res.status(500).json({ error: String(e && e.message || e) });
    }
};
