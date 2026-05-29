// TEMPORARY DIAGNOSTIC — remove after debugging.
// Cross-references Resend send history AND donation_log for a given address.
//
// Usage:
//   GET /api/diagnose-resend?email=zechariasteele@gmail.com&token=<TOKEN>

const { neon } = require('@neondatabase/serverless');

const TEMP_TOKEN = 'diag-zT4kQ9p2W8eR3xLv7nM5jH1bF6yA0sCd';

module.exports = async function handler(req, res) {
    var provided = '';
    var auth = req.headers['authorization'] || '';
    if (auth.indexOf('Bearer ') === 0) provided = auth.slice(7).trim();
    if (!provided && req.query && req.query.token) provided = String(req.query.token).trim();
    if (provided !== TEMP_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

    var email = (req.query && req.query.email) ? String(req.query.email).trim().toLowerCase() : '';
    if (!email) return res.status(400).json({ error: 'missing ?email=<address>' });

    var key = process.env.RESEND_API_KEY;
    if (!key) return res.status(500).json({ error: 'RESEND_API_KEY not set' });

    var out = { target: email };

    // 1. Check donation_log for recipient matches
    if (process.env.DATABASE_URL) {
        try {
            var sql = neon(process.env.DATABASE_URL);
            var rows = await sql`
                SELECT donation_key, team_name, amount, recipient, sent_at
                FROM donation_log
                WHERE LOWER(recipient) LIKE ${'%' + email + '%'}
                ORDER BY sent_at DESC
                LIMIT 50
            `;
            out.donation_log = {
                count: rows.length,
                rows: rows.map(function (r) {
                    return {
                        donation_key: r.donation_key,
                        team_name: r.team_name,
                        amount: Number(r.amount),
                        recipient: r.recipient,
                        sent_at: r.sent_at
                    };
                })
            };
        } catch (e) {
            out.donation_log_error = String(e && e.message || e);
        }
    }

    // 2. Page through Resend's recent emails, looking for our address
    try {
        var matched = [];
        var nonMatched = 0;
        var pageTotal = 0;
        // Resend has cursor pagination via `before`/`after` params; we'll
        // sweep the most recent 200 emails.
        var lastTs = null;
        for (var page = 0; page < 4; page++) {
            var url = 'https://api.resend.com/emails?limit=50';
            if (lastTs) url += '&before=' + encodeURIComponent(lastTs);
            var r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + key } });
            if (!r.ok) {
                out.resend_list_error = { status: r.status, body: (await r.text()).slice(0, 300) };
                break;
            }
            var j = await r.json();
            var list = j.data || [];
            pageTotal += list.length;
            if (!list.length) break;
            for (var i = 0; i < list.length; i++) {
                var e = list[i];
                var toList = (e.to || []).map(function (x) { return (x || '').toLowerCase(); });
                if (toList.indexOf(email) >= 0) {
                    matched.push({
                        id: e.id,
                        created_at: e.created_at,
                        last_event: e.last_event,
                        from: e.from,
                        to: e.to,
                        subject: e.subject
                    });
                }
                lastTs = e.created_at;
            }
            nonMatched += list.length - matched.length;
            // Stop early if Resend already gave us less than the page size
            if (list.length < 50) break;
            // Avoid rate limit
            await sleep(250);
        }
        out.resend_scanned = pageTotal;
        out.resend_matches = matched;
    } catch (e) {
        out.resend_scan_error = String(e && e.message || e);
    }

    return res.status(200).json(out);
};

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
