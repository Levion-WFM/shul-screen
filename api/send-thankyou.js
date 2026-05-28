// Sends a thank-you email through Resend with the generated PNG attached.
//
// Expected POST body (JSON):
//   {
//     to:          "raiser@example.com"          (one address or comma-separated)
//     teamName:    "Ahron & Sorala Jaffa"
//     amount:      36                            (raw number, optional, used in subject/body)
//     imageBase64: "data:image/png;base64,..."   (the rendered thank-you card)
//     donationKey: "ch_3Tc7rHGgzUhqv..."         (optional; if present we de-dupe on it)
//     force:       true                          (optional; resend even if key was logged)
//   }
//
// Env vars required on Vercel:
//   RESEND_API_KEY  — your Resend API key (https://resend.com/api-keys)
//   DATABASE_URL    — Neon connection string (already set for the kiosk)
//   THANKYOU_FROM   — verified sender, e.g. "BMJ21 <thankyou@bmj21.com>"
//                     If unset, falls back to Resend's test sender which only
//                     ships to the account owner — fine for first-run tests,
//                     not fine for real use.

const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    var to          = (body.to || '').toString().trim();
    var teamName    = (body.teamName || '').toString().trim();
    var donorName   = (body.donorName || '').toString().trim();
    var amount      = Number(body.amount || 0);
    var image       = (body.imageBase64 || '').toString();
    var donationKey = (body.donationKey || '').toString().trim();
    var force       = !!body.force;

    if (!to)       return res.status(400).json({ error: 'Missing `to`' });
    if (!teamName) return res.status(400).json({ error: 'Missing `teamName`' });
    if (!image || image.indexOf('data:image/') !== 0) {
        return res.status(400).json({ error: 'Missing or malformed `imageBase64` (expect a data: URL)' });
    }

    var apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not set on Vercel' });

    var sql = null;
    if (donationKey && process.env.DATABASE_URL) {
        sql = neon(process.env.DATABASE_URL);
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS donation_log (
                    donation_key   TEXT PRIMARY KEY,
                    team_id        TEXT,
                    team_name      TEXT,
                    amount         NUMERIC,
                    recipient      TEXT,
                    sent_at        TIMESTAMPTZ DEFAULT NOW()
                )
            `;
            if (!force) {
                var existing = await sql`SELECT sent_at FROM donation_log WHERE donation_key = ${donationKey} LIMIT 1`;
                if (existing.length) {
                    return res.status(200).json({
                        ok: true,
                        alreadySent: true,
                        sentAt: existing[0].sent_at
                    });
                }
            }
        } catch (e) {
            // DB hiccup shouldn't block a send — log and continue without dedup.
            console.error('donation_log preflight failed:', e);
        }
    }

    var base64 = image.replace(/^data:image\/\w+;base64,/, '');
    var recipients = to.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    var amountStr = amount > 0 ? '$' + amount.toLocaleString('en-US') : '';

    // Raiser-centric: the email goes to the team owner ("raiser"); the
    // attached PNG carries the donor's name in the gold rectangle so the
    // raiser can forward it as-is to the donor. The subject + body name
    // both the donor and the amount so the raiser sees at a glance what
    // came in to their team.
    var greeting = teamName ? 'Mazel tov ' + teamName : 'Mazel tov';
    var donorBit = donorName ? ' from ' + donorName : '';
    var subject  = amount > 0
        ? 'Mazel tov! ' + (teamName ? teamName + ' just received a ' + amountStr + ' donation' + donorBit
                                   : 'a ' + amountStr + ' donation' + donorBit + ' just came in')
        : 'Mazel tov! a new donation' + donorBit + (teamName ? ' to ' + teamName + '’s team' : '');

    var html = ''
        + '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1b3148;">'
        +   '<p style="font-size:18px;line-height:1.5;">' + escapeHtml(greeting) + ',</p>'
        +   '<p style="font-size:16px;line-height:1.6;">'
        +     'Your team just received '
        +     (amountStr ? 'a <strong>' + escapeHtml(amountStr) + '</strong> ' : 'a new ')
        +     'donation'
        +     (donorName ? ' from <strong>' + escapeHtml(donorName) + '</strong>' : '')
        +     ' toward the <strong>Beis Medrash D&rsquo;Jackson 21 Building Campaign</strong>.'
        +   '</p>'
        +   '<p style="font-size:16px;line-height:1.6;">'
        +     'A personalized thank-you note for the donor is attached — feel free to forward it to '
        +     (donorName ? escapeHtml(donorName) : 'them')
        +     ' along with your own note when you have a moment.'
        +   '</p>'
        +   '<p style="font-size:14px;color:#888;margin-top:32px;">With gratitude,<br/>Beis Medrash D&rsquo;Jackson 21</p>'
        + '</div>';

    var from = process.env.THANKYOU_FROM || 'BMJ21 Building Campaign <onboarding@resend.dev>';

    try {
        var r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from,
                to: recipients,
                subject: subject,
                html: html,
                attachments: [{
                    filename: 'thank-you-' + slug(teamName) + '.png',
                    content: base64
                }]
            })
        });
        var data = await r.json();
        if (!r.ok) {
            return res.status(r.status).json({ error: 'Resend error', detail: data });
        }

        // Log only after the send succeeded. UPSERT so a force-resend overwrites
        // the prior row's sent_at instead of erroring on the primary key.
        if (sql && donationKey) {
            try {
                await sql`
                    INSERT INTO donation_log (donation_key, team_id, team_name, amount, recipient, sent_at)
                    VALUES (${donationKey}, ${String(body.teamId || '')}, ${teamName}, ${amount}, ${to}, NOW())
                    ON CONFLICT (donation_key) DO UPDATE SET sent_at = NOW(), recipient = EXCLUDED.recipient
                `;
            } catch (e) {
                console.error('donation_log insert failed:', e);
            }
        }

        return res.status(200).json({ ok: true, id: data.id });
    } catch (e) {
        return res.status(500).json({ error: 'Send failed', detail: String(e && e.message || e) });
    }
};

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}
