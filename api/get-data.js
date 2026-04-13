const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`SELECT data FROM screen_data WHERE id = 1`;
        res.json(rows.length > 0 ? rows[0].data : null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
