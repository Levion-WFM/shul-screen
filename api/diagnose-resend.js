// TEMPORARY — about to be deleted.
// Adds domain-verification status to the previous email/donation_log checks.

const { neon } = require('@neondatabase/serverless');
const TEMP_TOKEN = 'diag-zT4kQ9p2W8eR3xLv7nM5jH1bF6yA0sCd';

module.exports = async function handler(req, res) {
    var provided = '';
    var auth = req.headers['authorization'] || '';
    if (auth.indexOf('Bearer ') === 0) provided = auth.slice(7).trim();
    if (!provided && req.query && req.query.token) provided = String(req.query.token).trim();
    if (provided !== TEMP_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

    var key = process.env.RESEND_API_KEY;
    if (!key) return res.status(500).json({ error: 'RESEND_API_KEY not set' });

    var email = (req.query && req.query.email) ? String(req.query.email).trim().toLowerCase() : '';
    var out = { target: email || null };

    // Domains check
    try {
        var dr = await fetch('https://api.resend.com/domains', {
            headers: { 'Authorization': 'Bearer ' + key }
        });
        if (dr.ok) {
            var dj = await dr.json();
            out.domains = (dj.data || []).map(function (d) {
                return {
                    name: d.name,
                    status: d.status,            // pending, verified, failed
                    region: d.region,
                    created_at: d.created_at
                };
            });
        } else {
            out.domains_error = { status: dr.status, body: (await dr.text()).slice(0, 300) };
        }
    } catch (e) {
        out.domains_error = String(e);
    }

    // Per-domain DNS records (only fetch when we have domains and a target)
    if (out.domains && out.domains.length) {
        try {
            for (var i = 0; i < out.domains.length; i++) {
                var d = out.domains[i];
                if (d.status === 'verified') continue;  // No need to inspect verified ones
                var detResp = await fetch('https://api.resend.com/domains/' + encodeURIComponent(d.name), {
                    headers: { 'Authorization': 'Bearer ' + key }
                });
                if (detResp.ok) {
                    var dj = await detResp.json();
                    d.records = (dj.records || []).map(function (rec) {
                        return { type: rec.type, name: rec.name, status: rec.status };
                    });
                }
            }
        } catch (e) {
            out.domains_records_error = String(e);
        }
    }

    if (email) {
        // donation_log cross-ref
        if (process.env.DATABASE_URL) {
            try {
                var sql = neon(process.env.DATABASE_URL);
                var rows = await sql`
                    SELECT donation_key, team_name, amount, recipient, sent_at
                    FROM donation_log
                    WHERE LOWER(recipient) LIKE ${'%' + email + '%'}
                    ORDER BY sent_at DESC LIMIT 50
                `;
                out.donation_log_count = rows.length;
                out.donation_log = rows;
            } catch (e) { out.donation_log_error = String(e); }
        }

        // Scan recent emails
        try {
            var matched = [];
            var pageTotal = 0;
            var lastTs = null;
            for (var p = 0; p < 4; p++) {
                var u = 'https://api.resend.com/emails?limit=50';
                if (lastTs) u += '&before=' + encodeURIComponent(lastTs);
                var r = await fetch(u, { headers: { 'Authorization': 'Bearer ' + key } });
                if (!r.ok) break;
                var j = await r.json();
                var list = j.data || [];
                pageTotal += list.length;
                if (!list.length) break;
                for (var k2 = 0; k2 < list.length; k2++) {
                    var e2 = list[k2];
                    var toList = (e2.to || []).map(function (x) { return (x || '').toLowerCase(); });
                    if (toList.indexOf(email) >= 0) {
                        matched.push({
                            id: e2.id, created_at: e2.created_at,
                            last_event: e2.last_event, to: e2.to,
                            subject: e2.subject
                        });
                    }
                    lastTs = e2.created_at;
                }
                if (list.length < 50) break;
                await new Promise(function (rr) { setTimeout(rr, 200); });
            }
            out.resend_scanned = pageTotal;
            out.resend_matches = matched;
        } catch (e) { out.resend_scan_error = String(e); }
    }

    return res.status(200).json(out);
};
