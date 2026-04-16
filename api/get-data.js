const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Fetch manual screen data
        var rows = await sql`SELECT data FROM screen_data WHERE id = 1`;
        var data = (rows.length > 0 && rows[0].data) ? rows[0].data : {};

        // Find this week's Shabbos (upcoming Saturday, or today if Saturday)
        var now = new Date();
        var dayOfWeek = now.getUTCDay();
        var daysUntilShabbos = dayOfWeek === 6 ? 0 : ((6 - dayOfWeek + 7) % 7);
        var shabbosDate = new Date(now.getTime() + daysUntilShabbos * 86400000);
        var shabbosStr = shabbosDate.toISOString().split('T')[0];
        var todayStr = now.toISOString().split('T')[0];

        // Shabbat zmanim
        var zmanimRows = [];
        try {
            zmanimRows = await sql`SELECT * FROM shabbos_zmanim WHERE shabbos_date = ${shabbosStr} LIMIT 1`;
            if (zmanimRows.length === 0) {
                zmanimRows = await sql`SELECT * FROM shabbos_zmanim WHERE shabbos_date >= ${todayStr} ORDER BY shabbos_date ASC LIMIT 1`;
            }
        } catch (e) { console.error('shabbos_zmanim error:', e.message); }

        if (zmanimRows.length > 0) {
            var z = zmanimRows[0];
            if (!data.zmanim) data.zmanim = {};
            if (z.parsha) data.zmanim.parshat = z.parsha;
            if (z.candle_lighting) data.zmanim.candleLighting = z.candle_lighting;
            if (z.mincha_erev_shabbos) data.zmanim.minchaFriday = z.mincha_erev_shabbos;
            if (z.shacharit) data.zmanim.shacharit = z.shacharit;
            if (z.mincha_shabbos) data.zmanim.minchaSaturday = z.mincha_shabbos;
            if (z.maariv) data.zmanim.havdalah = z.maariv;
        }

        // Daily zmanim
        try {
            var dailyRows = await sql`SELECT * FROM daily_zmanim WHERE civil_date = ${todayStr} LIMIT 1`;
            if (dailyRows.length > 0) {
                var d = dailyRows[0];
                data.dailyZmanim = {
                    alos72: d.alos72,
                    talis: d.talis,
                    sunrise: d.sunrise,
                    shemaMa: d.shema_ma,
                    shemaGra: d.shema_gra,
                    shachrisGra: d.shachris_gra,
                    midday: d.midday,
                    minchaGedola: d.mincha_gedola,
                    plag: d.plag,
                    sunset: d.sunset,
                    tzes3stars: d.tzes_3stars,
                    tzes72fix: d.tzes72fix
                };
            }
        } catch (e) { console.error('daily_zmanim error:', e.message); }

        // Hebrew date
        try {
            var hebrewRows = await sql`SELECT hebrew_date FROM hebrew_dates WHERE gregorian_date = ${todayStr} LIMIT 1`;
            if (hebrewRows.length > 0) {
                if (!data.zmanim) data.zmanim = {};
                data.zmanim.hebrewDate = hebrewRows[0].hebrew_date;
            }
        } catch (e) { console.error('hebrew_dates error:', e.message); }

        res.json(data);
    } catch (err) {
        console.error('get-data error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
