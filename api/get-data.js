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

        // Dates: today and tomorrow in the kiosk's civil timezone.
        // The kiosk is in Jackson NJ (America/New_York). Using UTC here was a silent bug:
        // between ~8pm and midnight local, UTC is already the next civil day, so `todayStr`
        // returned tomorrow's Hebrew date / sefirah / zmanim as "today".
        var KIOSK_TZ = 'America/New_York';
        var now = new Date();
        var ymdFmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: KIOSK_TZ, year: 'numeric', month: '2-digit', day: '2-digit'
        });
        var todayStr = ymdFmt.format(now); // en-CA gives YYYY-MM-DD
        var tomorrowStr = ymdFmt.format(new Date(now.getTime() + 86400000));

        // ── Shabbos Zmanim ──
        // Find this week's Shabbos (upcoming Saturday, or today if Saturday)
        // Day-of-week must be computed in kiosk tz, not UTC, for the same reason as todayStr.
        var dowFmt = new Intl.DateTimeFormat('en-US', { timeZone: KIOSK_TZ, weekday: 'short' });
        var dowMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        var dayOfWeek = dowMap[dowFmt.format(now)];
        var daysUntilShabbos = dayOfWeek === 6 ? 0 : ((6 - dayOfWeek + 7) % 7);
        var shabbosStr = ymdFmt.format(new Date(now.getTime() + daysUntilShabbos * 86400000));

        try {
            var zmanimRows = await sql`SELECT * FROM shabbos_zmanim WHERE shabbos_date = ${shabbosStr} LIMIT 1`;
            if (zmanimRows.length === 0) {
                zmanimRows = await sql`SELECT * FROM shabbos_zmanim WHERE shabbos_date >= ${todayStr} ORDER BY shabbos_date ASC LIMIT 1`;
            }
            if (zmanimRows.length > 0) {
                var z = zmanimRows[0];
                if (!data.zmanim) data.zmanim = {};
                // shabbos_zmanim (edited via zmanim-editor.html) is the source of truth.
                // Previously we guarded with `!data.zmanim.X` to let manual overrides win,
                // but backend.html saves its pre-filled form values back into
                // screen_data.data.zmanim, turning last week's auto-populated values into
                // sticky "overrides" — so the card stayed frozen on last week's times after
                // the Sat→Sun rollover. Always prefer the DB row when present.
                if (z.parsha) data.zmanim.parshat = z.parsha;
                if (z.candle_lighting) data.zmanim.candleLighting = z.candle_lighting;
                if (z.mincha_erev_shabbos) data.zmanim.minchaFriday = z.mincha_erev_shabbos;
                if (z.mincha_a) data.zmanim.minchaFridayA = z.mincha_a;
                if (z.shacharit) data.zmanim.shacharit = z.shacharit;
                if (z.mincha_shabbos) data.zmanim.minchaSaturday = z.mincha_shabbos;
                if (z.maariv) data.zmanim.havdalah = z.maariv;
            }
        } catch (e) { console.error('shabbos_zmanim error:', e.message); }

        // ── Daily Zmanim (today + tomorrow for end-of-day countdown rollover) ──
        try {
            var dailyRows = await sql`
                SELECT * FROM daily_zmanim
                WHERE civil_date IN (${todayStr}, ${tomorrowStr})
                ORDER BY civil_date ASC`;
            function rowToDz(d) {
                return {
                    alos72: d.alos72, talis: d.talis, sunrise: d.sunrise,
                    shemaMa: d.shema_ma, shemaGra: d.shema_gra, shachrisGra: d.shachris_gra,
                    midday: d.midday, minchaGedola: d.mincha_gedola, plag: d.plag,
                    sunset: d.sunset, tzes3stars: d.tzes_3stars, tzes72fix: d.tzes72fix,
                    holidayHebrew: d.holiday_hebrew || null,
                    holidayEnglish: d.holiday_english || null,
                    parshaHebrew: d.parsha_hebrew || null,
                    parshaEnglish: d.parsha_english || null,
                    dafYomi: d.daf_yomi || null,
                    candleLighting: d.candle_lighting || null
                };
            }
            dailyRows.forEach(function(d) {
                var key = d.civil_date.toISOString().split('T')[0];
                if (key === todayStr) data.dailyZmanim = rowToDz(d);
                if (key === tomorrowStr) data.dailyZmanimTomorrow = rowToDz(d);
            });
        } catch (e) { console.error('daily_zmanim error:', e.message); }

        // ── Hebrew Date (today + tomorrow for shkiyah switching) ──
        try {
            var hebrewRows = await sql`
                SELECT gregorian_date, hebrew_date FROM hebrew_dates
                WHERE gregorian_date IN (${todayStr}, ${tomorrowStr})
                ORDER BY gregorian_date
            `;
            data.hebrewDates = {};
            hebrewRows.forEach(function(r) {
                var dateKey = r.gregorian_date.toISOString().split('T')[0];
                if (dateKey === todayStr) data.hebrewDates.today = r.hebrew_date;
                if (dateKey === tomorrowStr) data.hebrewDates.tomorrow = r.hebrew_date;
            });
            // Backward compat
            if (!data.zmanim) data.zmanim = {};
            data.zmanim.hebrewDate = data.hebrewDates.today;
        } catch (e) { console.error('hebrew_dates error:', e.message); }

        // ── Sefirah (today + tomorrow for shkiyah switching) ──
        try {
            var sefirahRows = await sql`
                SELECT civil_date, omer_day, omer_hebrew FROM sefirah
                WHERE civil_date IN (${todayStr}, ${tomorrowStr})
                ORDER BY civil_date
            `;
            data.sefirah = {};
            sefirahRows.forEach(function(r) {
                var dateKey = r.civil_date.toISOString().split('T')[0];
                if (dateKey === todayStr) {
                    data.sefirah.today = { day: r.omer_day, hebrew: r.omer_hebrew };
                }
                if (dateKey === tomorrowStr) {
                    data.sefirah.tomorrow = { day: r.omer_day, hebrew: r.omer_hebrew };
                }
            });
        } catch (e) { console.error('sefirah error:', e.message); }

        // ── Expire past community fliers ──
        // Event-dated fliers auto-disappear after their date passes (in kiosk TZ).
        // Fliers with no eventDate are evergreen and always shown. todayStr is already
        // the kiosk-local YYYY-MM-DD, so string comparison works correctly.
        if (Array.isArray(data.communityFliers)) {
            data.communityFliers = data.communityFliers.filter(function(f) {
                if (!f || !f.eventDate) return true;
                return String(f.eventDate) >= todayStr;
            });
        }

        // ── Remote-reload nonce ──
        // Admin bumps screen_data.data.reloadNonce (via /api/force-reload) to tell all
        // running kiosks to reload and pick up the latest deploy. Pass through as-is.
        if (typeof data.reloadNonce === 'undefined') data.reloadNonce = null;

        // ── Tzeis hachochavim for client-side day-flip ──
        // The halachic day transitions at tzeis (3 stars visible), NOT at shkiyah (sunset).
        // Kiosk uses this to flip Hebrew date + Sefirah to tomorrow's values.
        // We publish both so the client can choose; current client reads tzeisTime.
        data.tzeisTime = (data.dailyZmanim && data.dailyZmanim.tzes3stars) || null;
        data.sunsetTime = (data.dailyZmanim && data.dailyZmanim.sunset) || null;

        res.json(data);
    } catch (err) {
        console.error('get-data error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
