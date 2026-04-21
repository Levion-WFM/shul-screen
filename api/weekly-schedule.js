const { neon } = require('@neondatabase/serverless');

// Zmanim payload for the printable weekly schedule poster.
// All data comes from the kiosk DB — no runtime Hebcal calls:
//   - shabbos_zmanim : shul-specific times entered by the gabbai
//                      (parsha, candle_lighting, mincha_erev_shabbos,
//                      shacharit, mincha_shabbos, maariv)
//   - daily_zmanim   : MyZmanim-seeded astronomical zmanim
//                      (plag, sunset, sunrise) — plus parsha fallback
//
// mincha_ketana isn't in either table (MyZmanim's export didn't include it),
// so we compute it from sunrise + sunset using the proportional/GRA hour:
//     halachic_hour = (sunset - sunrise) / 12
//     mincha_ketana = sunset - 2.5 * halachic_hour
// This matches Hebcal's value to the minute for Jackson, NJ.

const KIOSK_TZ = 'America/New_York';

function ymd(d) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: KIOSK_TZ, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(d);
}

// Find this week's Shabbos (upcoming Saturday, or today if Saturday).
function upcomingShabbos(base) {
    const now = base || new Date();
    const dowFmt = new Intl.DateTimeFormat('en-US', { timeZone: KIOSK_TZ, weekday: 'short' });
    const dowMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dow = dowMap[dowFmt.format(now)];
    const daysUntil = dow === 6 ? 0 : ((6 - dow + 7) % 7);
    return ymd(new Date(now.getTime() + daysUntil * 86400000));
}

// Parse "4:36 AM" / "7:46 PM" / "12:55 PM" into minutes-from-midnight.
// Returns null if the input doesn't parse.
function parseClockToMin(s) {
    if (!s || typeof s !== 'string') return null;
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(s.trim());
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3] ? m[3].toUpperCase() : null;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + min;
}

// Format minutes-from-midnight back to "H:MM" (12h, no AM/PM — matches poster style).
function fmtHMM(totalMin) {
    if (totalMin == null || !isFinite(totalMin)) return null;
    const t = Math.round(totalMin);
    let h = Math.floor(t / 60) % 24;
    const m = t % 60;
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return h + ':' + String(m).padStart(2, '0');
}

// Strip AM/PM from a MyZmanim time string so the poster shows "7:46" not "7:46 PM".
function clockNoAmPm(s) {
    if (!s) return null;
    const m = /^(\d{1,2}:\d{2})/.exec(String(s).trim());
    return m ? m[1] : s;
}

// Mincha ketana via GRA proportional hours.
function computeMinchaKetana(sunriseStr, sunsetStr) {
    const rise = parseClockToMin(sunriseStr);
    const set = parseClockToMin(sunsetStr);
    if (rise == null || set == null || set <= rise) return null;
    const hh = (set - rise) / 12;
    return fmtHMM(set - 2.5 * hh);
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not set' });

    try {
        const shabbosStr = upcomingShabbos();
        const sql = neon(process.env.DATABASE_URL);

        // Shul-specific row for this Shabbos. Fall back to the next populated
        // Shabbos so the poster doesn't go blank if the gabbai hasn't entered
        // this week's row yet.
        let shabbosRow = null;
        try {
            const rows = await sql`
                SELECT shabbos_date, parsha, candle_lighting, mincha_a, mincha_erev_shabbos,
                       shacharit, mincha_shabbos, maariv
                FROM shabbos_zmanim
                WHERE shabbos_date = ${shabbosStr}::date
                LIMIT 1
            `;
            if (rows.length) {
                shabbosRow = rows[0];
            } else {
                const next = await sql`
                    SELECT shabbos_date, parsha, candle_lighting, mincha_erev_shabbos,
                           shacharit, mincha_shabbos, maariv
                    FROM shabbos_zmanim
                    WHERE shabbos_date >= ${shabbosStr}::date
                    ORDER BY shabbos_date ASC
                    LIMIT 1
                `;
                if (next.length) shabbosRow = next[0];
            }
        } catch (err) {
            console.error('shabbos_zmanim read failed:', err);
        }

        // Daily astronomical zmanim for the SAME date as shabbosRow (so they
        // agree even when shabbosRow came from the fallback).
        const dbDate = shabbosRow && shabbosRow.shabbos_date;
        const targetDate = dbDate instanceof Date
            ? dbDate.toISOString().slice(0, 10)
            : (dbDate || shabbosStr);

        let dailyRow = null;
        try {
            const rows = await sql`
                SELECT civil_date, sunrise, plag, sunset,
                       parsha_hebrew, parsha_english, candle_lighting
                FROM daily_zmanim
                WHERE civil_date = ${targetDate}::date
                LIMIT 1
            `;
            if (rows.length) dailyRow = rows[0];
        } catch (err) {
            console.error('daily_zmanim read failed:', err);
        }

        // Build output. Prefer shabbosRow values (gabbai-entered), fall back to
        // daily_zmanim for anything shabbosRow doesn't carry.
        // NOTE: the frontend page reads `parashaDb` / `parashaHebrew` (spelled
        // with the extra 'a') so match those exact key names here.
        const parashaDb = (shabbosRow && shabbosRow.parsha) || '';
        const parashaHebrew = (dailyRow && dailyRow.parsha_hebrew) || '';
        const parashaEnglish = (dailyRow && dailyRow.parsha_english) || '';
        const plag = dailyRow ? clockNoAmPm(dailyRow.plag) : null;
        const shkia = dailyRow ? clockNoAmPm(dailyRow.sunset) : null;
        const minchaKetana = dailyRow
            ? computeMinchaKetana(dailyRow.sunrise, dailyRow.sunset)
            : null;

        // Manifest (screen_data.data.zmanim) carries kids-learning times + the
        // rav-shiur toggles that the admin edits via the kiosk backend.
        let manifestZmanim = {};
        try {
            const mrow = await sql`SELECT data FROM screen_data WHERE id = 1 LIMIT 1`;
            manifestZmanim = ((mrow[0] && mrow[0].data) || {}).zmanim || {};
        } catch (err) {
            console.error('screen_data read failed:', err);
        }

        // Shiur time helpers:
        //   halacha shiur  = Shabbos Mincha - 20 min
        //   pirkei avos    = Maariv - 15 min, rounded to nearest 5
        // Matches the admin copy: "20 min before Mincha" / "~15 min before Maariv
        // rounded to nearest 5". Pull the source times from shabbosRow.
        function minusMinutes(timeStr, deltaMin, roundToNearest = null) {
            const t = parseClockToMin(timeStr);
            if (t == null) return null;
            let out = t - deltaMin;
            if (roundToNearest) out = Math.round(out / roundToNearest) * roundToNearest;
            return fmtHMM(out);
        }
        const minchaShabbosRaw = shabbosRow ? (shabbosRow.mincha_shabbos || null) : null;
        const maarivRaw = shabbosRow ? (shabbosRow.maariv || null) : null;
        const halachaShiurTime = manifestZmanim.shabbosShiurMincha
            ? minusMinutes(minchaShabbosRaw, 20)
            : null;
        const pirkeiAvosTime = manifestZmanim.shabbosShiurMaariv
            ? minusMinutes(maarivRaw, 15, 5)
            : null;

        // Kids learning times (entered as free text in the admin, e.g. "4:30 PM").
        const pircheiTime = clockNoAmPm((manifestZmanim.pircheiTime || '').trim());
        const avosUbanimTime = clockNoAmPm((manifestZmanim.avosUbanimTime || '').trim());

        return res.json({
            ok: true,
            date: targetDate,
            zmanim: {
                // Shul-specific (shabbos_zmanim)
                parashaDb,
                parashaHebrew,
                parashaEnglish,
                candles: shabbosRow ? (shabbosRow.candle_lighting || null) : null,
                minchaErevShabbosA: shabbosRow ? (clockNoAmPm(shabbosRow.mincha_a) || null) : null,
                minchaErevShabbos: shabbosRow ? (shabbosRow.mincha_erev_shabbos || null) : null,
                shacharis: shabbosRow ? (shabbosRow.shacharit || null) : null,
                minchaShabbos: shabbosRow ? (shabbosRow.mincha_shabbos || null) : null,
                maariv: shabbosRow ? (shabbosRow.maariv || null) : null,
                // Astronomical (daily_zmanim, seeded from MyZmanim)
                plag,
                shkia,
                minchaKetana,
                // Kids learning (admin free-text in screen_data.zmanim)
                pircheiTime: pircheiTime || null,
                avosUbanimTime: avosUbanimTime || null,
                // Rav shiurim (driven by admin toggles, time computed from Mincha/Maariv).
                // Each is null when the toggle is off — frontend uses that to omit the row.
                shiurim: [
                    halachaShiurTime && {
                        label: 'שיעור הלכה',
                        time: halachaShiurTime
                    },
                    pirkeiAvosTime && {
                        label: 'פרקי אבות',
                        time: pirkeiAvosTime
                    }
                ].filter(Boolean)
            },
            sources: {
                shabbos_zmanim_found: !!shabbosRow,
                daily_zmanim_found: !!dailyRow,
                manifest_found: Object.keys(manifestZmanim).length > 0
            }
        });
    } catch (err) {
        console.error('weekly-schedule error:', err);
        return res.status(500).json({ error: String((err && err.message) || err) });
    }
};
