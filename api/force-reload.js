const { neon } = require('@neondatabase/serverless');

// Bumps screen_data.data.reloadNonce so every running kiosk reloads on its next
// poll (~30s). Same admin auth as save-data.
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
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const nonce = Date.now();
        await sql`
            INSERT INTO screen_data (id, data, updated_at)
            VALUES (1, ${JSON.stringify({ reloadNonce: nonce })}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE
            SET data = jsonb_set(
                COALESCE(screen_data.data, '{}'::jsonb),
                '{reloadNonce}',
                to_jsonb(${nonce}::bigint)
            ),
            updated_at = NOW()
        `;
        res.json({ success: true, reloadNonce: nonce });
    } catch (err) {
        console.error('force-reload error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
