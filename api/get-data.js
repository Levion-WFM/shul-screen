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

        // Fetch daily zmanim for today
        var todayStr = now.toISOString().split('T')[0];
        var dailyRows = await sql`
            SELECT * FROM daily_zmanim
            WHERE civil_date = ${todayStr}::date
            LIMIT 1
        `;

        if (dailyRows.length > 0) {
            var d = dailyRows[0];
            if (!data.dailyZmanim) data.dailyZmanim = {};
            data.dailyZmanim.alos72 = d.alos72;
            data.dailyZmanim.talis = d.talis;
            data.dailyZmanim.sunrise = d.sunrise;
            data.dailyZmanim.shemaMa = d.shema_ma;
            data.dailyZmanim.shemaGra = d.shema_gra;
            data.dailyZmanim.shachrisGra = d.shachris_gra;
            data.dailyZmanim.midday = d.midday;
            data.dailyZmanim.minchaGedola = d.mincha_gedola;
            data.dailyZmanim.plag = d.plag;
            data.dailyZmanim.sunset = d.sunset;
            data.dailyZmanim.tzes3stars = d.tzes_3stars;
            data.dailyZmanim.tzes72fix = d.tzes72fix;
        }

        // Auto-populate Hebrew date from hebrew_dates table
        var hebrewRows = await sql`
            SELECT hebrew_date FROM hebrew_dates
            WHERE gregorian_date = ${todayStr}::date
            LIMIT 1
        `;
        if (hebrewRows.length > 0) {
            if (!data.zmanim) data.zmanim = {};
            data.zmanim.hebrewDate = hebrewRows[0].hebrew_date;
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
