const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Fetch manual screen data
        const rows = await sql`SELECT data FROM screen_data WHERE id = 1`;
        var data = (rows.length > 0 && rows[0].data) ? rows[0].data : {};

        // Find this week's Shabbos (upcoming Saturday, or today if Saturday)
        var now = new Date();
        var dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat
        var daysUntilShabbos = dayOfWeek === 6 ? 0 : ((6 - dayOfWeek + 7) % 7);
        var shabbosDate = new Date(now.getTime() + daysUntilShabbos * 86400000);
        var shabbosStr = shabbosDate.toISOString().split('T')[0];

        // Auto-populate Shabbat zmanim from DB
        var zmanimRows = await sql`
            SELECT * FROM shabbos_zmanim
            WHERE shabbos_date = ${shabbosStr}::date
            LIMIT 1
        `;

        // If exact match fails, try closest upcoming
        if (zmanimRows.length === 0) {
            zmanimRows = await sql`
                SELECT * FROM shabbos_zmanim
                WHERE shabbos_date >= CURRENT_DATE
                ORDER BY shabbos_date ASC
                LIMIT 1
            `;
        }

        if (zmanimRows.length > 0) {
            var z = zmanimRows[0];
            if (!data.zmanim) data.zmanim = {};
            data.zmanim.parshat = z.parsha || data.zmanim.parshat;
            data.zmanim.candleLighting = z.candle_lighting || data.zmanim.candleLighting;
            data.zmanim.minchaFriday = z.mincha_erev_shabbos || data.zmanim.minchaFriday;
            data.zmanim.shacharit = z.shacharit || data.zmanim.shacharit;
            data.zmanim.minchaSaturday = z.mincha_shabbos || data.zmanim.minchaSaturday;
            data.zmanim.havdalah = z.maariv || data.zmanim.havdalah;
        }

        // Also fetch daily zmanim for today if available
        var todayStr = now.toISOString().split('T')[0];
        var dailyRows = await sql`
            SELECT * FROM daily_zmanim
            WHERE zman_date = ${todayStr}::date
            LIMIT 1
        `;

        if (dailyRows.length > 0) {
            var d = dailyRows[0];
            if (!data.zmanim) data.zmanim = {};
            data.zmanim.alot = d.alot_hashachar || data.zmanim.alot;
            data.zmanim.sunrise = d.sunrise || data.zmanim.sunrise;
            data.zmanim.shema = d.sof_zman_shema_gra || data.zmanim.shema;
            data.zmanim.sunset = d.sunset || data.zmanim.sunset;
        }

        // Add debug info (remove after confirming it works)
        data._debug = {
            shabbosStr: shabbosStr,
            zmanimFound: zmanimRows.length > 0,
            zmanimParsha: zmanimRows.length > 0 ? zmanimRows[0].parsha : null,
            todayStr: todayStr,
            utcDay: dayOfWeek,
            daysUntil: daysUntilShabbos
        };

        res.json(data);
    } catch (err) {
        console.error('get-data error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
