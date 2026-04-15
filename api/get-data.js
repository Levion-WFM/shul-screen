const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    try {
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`SELECT data FROM screen_data WHERE id = 1`;
        res.json(rows.length > 0 ? rows[0].data : null);
    } catch (err) {
        console.error('get-data error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
