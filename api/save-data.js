const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    // Auth check — if ADMIN_TOKEN is set, require it
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${adminToken}`) {
            return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
        }
    }

    // Payload size check (500KB max)
    const payload = JSON.stringify(req.body);
    if (payload.length > 500000) {
        return res.status(413).json({ error: 'Payload too large — max 500KB' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const data = req.body;
        await sql`
            INSERT INTO screen_data (id, data, updated_at)
            VALUES (1, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE
            SET data = EXCLUDED.data, updated_at = NOW()
        `;
        res.json({ success: true });
    } catch (err) {
        console.error('save-data error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
