const { neon } = require('@neondatabase/serverless');

// Bumps screen_data.data.forceReloadAt to the current epoch ms. The kiosk
// includes this value in its `buildId` nonce (see api/get-data.js) and
// hard-reloads on change, so admins can push new HTML/data to the screen
// without physically touching the Pi.
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    // Same auth model as save-data: bearer ADMIN_TOKEN if configured.
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${adminToken}`) {
            return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
        }
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const now = Date.now();
        await sql`
            INSERT INTO screen_data (id, data, updated_at)
            VALUES (1, jsonb_build_object('forceReloadAt', ${now}::bigint), NOW())
            ON CONFLICT (id) DO UPDATE
            SET data = jsonb_set(
                    COALESCE(screen_data.data, '{}'::jsonb),
                    '{forceReloadAt}',
                    to_jsonb(${now}::bigint)
                ),
                updated_at = NOW()
        `;
        res.json({ success: true, forceReloadAt: now });
    } catch (err) {
        console.error('force-reload error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
