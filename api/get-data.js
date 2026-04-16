const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Fetch manual screen data
        const rows = await sql`SELECT data FROM screen_data WHERE id = 1`;
        const data = rows.length > 0 ? rows[0].data : {};

        // Auto-populate zmanim from shabbos_zmanim table
        // Find this week's Shabbos (upcoming Saturday, or today if Saturday)
        const now = new Date();
        const dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat
        const daysUntilShabbos = dayOfWeek === 6 ? 0 : (6 - dayOfWeek);
        const shabbosDate = new Date(now);
        shabbosDate.setUTCDate(shabbosDate.getUTCDate() + daysUntilShabbos);
        const shabbosStr = shabbosDate.toISOString().split('T')[0];

        const zmanimRows = await sql`
            SELECT * FROM shabbos_zmanim
            WHERE shabbos_date = ${shabbosStr}
            LIMIT 1
        `;

        if (zmanimRows.length > 0) {
            const z = zmanimRows[0];
            const existing = data.zmanim || {};
            data.zmanim = {
                ...existing,
                parshat: z.parsha || existing.parshat,
                candleLighting: z.candle_lighting || existing.candleLighting,
                minchaFriday: z.mincha_erev_shabbos || existing.minchaFriday,
                shacharit: z.shacharit || existing.shacharit,
                minchaSaturday: z.mincha_shabbos || existing.minchaSaturday,
                havdalah: z.maariv || existing.havdalah,
            };
        }

        // Also fetch daily zmanim for today if available
        const todayStr = now.toISOString().split('T')[0];
        const dailyRows = await sql`
            SELECT * FROM daily_zmanim
            WHERE zman_date = ${todayStr}
            LIMIT 1
        `;

        if (dailyRows.length > 0) {
            const d = dailyRows[0];
            const existing = data.zmanim || {};
            data.zmanim = {
                ...existing,
                alot: d.alot_hashachar || existing.alot,
                sunrise: d.sunrise || existing.sunrise,
                shema: d.sof_zman_shema_gra || existing.shema,
                sunset: d.sunset || existing.sunset,
            };
        }

        res.json(data);
    } catch (err) {
        console.error('get-data error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
