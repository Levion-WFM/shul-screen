const { neon } = require('@neondatabase/serverless');

// Bulk editor API for shabbos_zmanim.
// GET  -> list all rows, sorted by shabbos_date asc
// POST -> upsert an array of rows; delete rows that are removed (optional)

function isValidDate(s) {
    return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function emptyToNull(v) {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
        try {
            const rows = await sql`
                SELECT shabbos_date, parsha, candle_lighting, mincha_erev_shabbos,
                       shacharit, mincha_shabbos, maariv
                FROM shabbos_zmanim
                ORDER BY shabbos_date ASC
            `;
            // Normalize date field to YYYY-MM-DD string for the client
            const out = rows.map(function(r) {
                let d = r.shabbos_date;
                if (d instanceof Date) d = d.toISOString().split('T')[0];
                return {
                    shabbos_date: d,
                    parsha: r.parsha || '',
                    candle_lighting: r.candle_lighting || '',
                    mincha_erev_shabbos: r.mincha_erev_shabbos || '',
                    shacharit: r.shacharit || '',
                    mincha_shabbos: r.mincha_shabbos || '',
                    maariv: r.maariv || ''
                };
            });
            return res.json({ rows: out });
        } catch (err) {
            console.error('shabbos-schedule GET error:', err);
            return res.status(500).json({ error: 'Failed to load schedule', details: err.message });
        }
    }

    if (req.method === 'POST') {
        // Auth check — if ADMIN_TOKEN is set, require it
        const adminToken = process.env.ADMIN_TOKEN;
        if (adminToken) {
            const auth = req.headers.authorization;
            if (!auth || auth !== `Bearer ${adminToken}`) {
                return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
            }
        }

        const body = req.body || {};
        const incoming = Array.isArray(body.rows) ? body.rows : null;
        const deleteMissing = body.deleteMissing === true; // when true, rows in DB not in payload get deleted
        if (!incoming) return res.status(400).json({ error: 'Body must be { rows: [...] }' });

        // Validate each row has a valid date
        for (const r of incoming) {
            if (!isValidDate(r.shabbos_date)) {
                return res.status(400).json({ error: 'Each row requires shabbos_date in YYYY-MM-DD form', badRow: r });
            }
        }

        try {
            // Upsert each row. Times are free-form strings ("7:13", "6:51 AM", etc.) — we don't try to parse.
            let written = 0;
            for (const r of incoming) {
                await sql`
                    INSERT INTO shabbos_zmanim (
                        shabbos_date, parsha, candle_lighting, mincha_erev_shabbos,
                        shacharit, mincha_shabbos, maariv
                    )
                    VALUES (
                        ${r.shabbos_date}::date,
                        ${emptyToNull(r.parsha)},
                        ${emptyToNull(r.candle_lighting)},
                        ${emptyToNull(r.mincha_erev_shabbos)},
                        ${emptyToNull(r.shacharit)},
                        ${emptyToNull(r.mincha_shabbos)},
                        ${emptyToNull(r.maariv)}
                    )
                    ON CONFLICT (shabbos_date) DO UPDATE SET
                        parsha = EXCLUDED.parsha,
                        candle_lighting = EXCLUDED.candle_lighting,
                        mincha_erev_shabbos = EXCLUDED.mincha_erev_shabbos,
                        shacharit = EXCLUDED.shacharit,
                        mincha_shabbos = EXCLUDED.mincha_shabbos,
                        maariv = EXCLUDED.maariv
                `;
                written++;
            }

            let deleted = 0;
            if (deleteMissing) {
                const keepSet = new Set(incoming.map(r => r.shabbos_date));
                // Grab every current date, diff against keepSet, delete ones that fell out.
                // This avoids IN-clause syntax quirks with the neon serverless driver for dynamic arrays.
                const existing = await sql`SELECT shabbos_date FROM shabbos_zmanim`;
                for (const row of existing) {
                    let d = row.shabbos_date;
                    if (d instanceof Date) d = d.toISOString().split('T')[0];
                    if (!keepSet.has(d)) {
                        await sql`DELETE FROM shabbos_zmanim WHERE shabbos_date = ${d}::date`;
                        deleted++;
                    }
                }
            }

            return res.json({ success: true, written, deleted });
        } catch (err) {
            console.error('shabbos-schedule POST error:', err);
            return res.status(500).json({ error: 'Save failed', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
