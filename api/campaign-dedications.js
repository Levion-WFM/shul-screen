const { neon } = require('@neondatabase/serverless');

// POST /api/campaign-dedications
// Replaces the list of "taken" building-campaign dedications shown in the
// kiosk's bottom scrolling ticker, and bumps the reload nonce so running
// screens pick up the change (~30s).
//
// Body: { dedications: ["Sha'ar Habinyan", "Paroches", ...] }  (full replace)
//   - Empty array clears the ticker (it hides on screen).
//
// Stored in its own table (like campaign_pledges) so a full screen_data save
// from the backend can't clobber it. Auth: same admin Bearer token as
// campaign-import (ADMIN_TOKEN).
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${adminToken}`) {
            return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
        }
    }

    const body = req.body || {};
    const incoming = Array.isArray(body) ? body : body.dedications;
    if (!Array.isArray(incoming)) {
        return res.status(400).json({ error: 'Expected a "dedications" array' });
    }

    // Normalize: trim, drop blanks, cap length, dedupe (case-insensitive), cap count.
    const seen = new Set();
    const labels = [];
    for (const raw of incoming) {
        const label = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim().slice(0, 80);
        if (!label) continue;
        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        labels.push(label);
        if (labels.length >= 30) break;
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        await sql`
            CREATE TABLE IF NOT EXISTS campaign_dedications (
                id BIGSERIAL PRIMARY KEY,
                label TEXT NOT NULL,
                sort_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`;

        const nonce = Date.now();
        const queries = [sql`DELETE FROM campaign_dedications`];
        labels.forEach((label, i) => {
            queries.push(sql`INSERT INTO campaign_dedications (label, sort_order) VALUES (${label}, ${i})`);
        });
        // Bump the reload nonce — same mechanism as campaign-import, so kiosks
        // reload on their next poll and render the new ticker.
        queries.push(sql`
            INSERT INTO screen_data (id, data, updated_at)
            VALUES (1, ${JSON.stringify({ reloadNonce: nonce })}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE
            SET data = jsonb_set(
                COALESCE(screen_data.data, '{}'::jsonb),
                '{reloadNonce}',
                to_jsonb(${nonce}::bigint)
            ),
            updated_at = NOW()
        `);
        await sql.transaction(queries);

        res.json({ success: true, dedications: labels.length, reloadNonce: nonce });
    } catch (err) {
        console.error('campaign-dedications error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
