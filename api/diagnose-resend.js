// TEMPORARY DIAGNOSTIC ENDPOINT — remove after debugging.
// Lists every Resend email sent to a given address with its full event timeline.
// Helps distinguish "Resend accepted it" from "Resend actually delivered it"
// (the difference between `last_event: sent` vs `last_event: delivered`).
//
// Usage:
//   GET /api/diagnose-resend?email=zechariasteele@gmail.com
//
// Auth: requires the same ADMIN_TOKEN used by /api/upload-template.
//   Header: Authorization: Bearer <ADMIN_TOKEN>
//   OR query: ?token=<ADMIN_TOKEN>

module.exports = async function handler(req, res) {
    var adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) return res.status(500).json({ error: 'ADMIN_TOKEN not set' });

    var provided = '';
    var auth = req.headers['authorization'] || '';
    if (auth.indexOf('Bearer ') === 0) provided = auth.slice(7).trim();
    if (!provided && req.query && req.query.token) provided = String(req.query.token).trim();
    if (provided !== adminToken) return res.status(401).json({ error: 'Unauthorized' });

    var email = (req.query && req.query.email) ? String(req.query.email).trim() : '';
    if (!email) return res.status(400).json({ error: 'missing ?email=<address>' });

    var key = process.env.RESEND_API_KEY;
    if (!key) return res.status(500).json({ error: 'RESEND_API_KEY not set' });

    try {
        // List emails to this recipient
        var listResp = await fetch('https://api.resend.com/emails?to=' + encodeURIComponent(email) + '&limit=20', {
            headers: { 'Authorization': 'Bearer ' + key }
        });
        var list = await listResp.json();
        if (!listResp.ok) {
            return res.status(listResp.status).json({ step: 'list', error: list });
        }

        var rows = list.data || [];

        // Get per-email detail with events
        var detailed = await Promise.all(rows.map(async function (e) {
            try {
                var dr = await fetch('https://api.resend.com/emails/' + e.id, {
                    headers: { 'Authorization': 'Bearer ' + key }
                });
                var dj = await dr.json();
                return {
                    id: e.id,
                    created_at: e.created_at,
                    last_event: dj.last_event,
                    from: dj.from,
                    to: dj.to,
                    subject: dj.subject,
                    // Some Resend tiers include `events` array on detail;
                    // surface whatever's there.
                    events: dj.events || null
                };
            } catch (err) {
                return { id: e.id, error: String(err) };
            }
        }));

        return res.status(200).json({
            target: email,
            count: detailed.length,
            emails: detailed
        });
    } catch (e) {
        return res.status(500).json({ error: String(e && e.message || e) });
    }
};
