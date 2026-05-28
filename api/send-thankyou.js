// Sends a thank-you email through Resend with the generated PNG attached.
//
// Expected POST body (JSON):
//   {
//     to:        "raiser@example.com"          (one address or comma-separated)
//     teamName:  "Ahron & Sorala Jaffa"
//     amount:    36                            (raw number, optional, used in subject/body)
//     imageBase64: "data:image/png;base64,..." (the rendered thank-you card)
//   }
//
// Env vars required on Vercel:
//   RESEND_API_KEY  — your Resend API key (https://resend.com/api-keys)
//   THANKYOU_FROM   — verified sender, e.g. "BMJ21 <thankyou@bmj21.com>"
//                     If unset, falls back to Resend's test sender which only
//                     ships to the account owner — fine for first-run tests,
//                     not fine for real use.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    var body = req.body || {};
    var to        = (body.to || '').toString().trim();
    var teamName  = (body.teamName || '').toString().trim();
    var amount    = Number(body.amount || 0);
    var image     = (body.imageBase64 || '').toString();

    if (!to)       return res.status(400).json({ error: 'Missing `to`' });
    if (!teamName) return res.status(400).json({ error: 'Missing `teamName`' });
    if (!image || image.indexOf('data:image/') !== 0) {
        return res.status(400).json({ error: 'Missing or malformed `imageBase64` (expect a data: URL)' });
    }

    var apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not set on Vercel' });

    // Strip the "data:image/png;base64," prefix — Resend wants raw base64.
    var base64 = image.replace(/^data:image\/\w+;base64,/, '');

    // Recipients can be comma-separated in the CSV ("a@x.com, b@x.com").
    var recipients = to.split(',').map(function(s) { return s.trim(); }).filter(Boolean);

    var amountStr = amount > 0 ? '$' + amount.toLocaleString('en-US') : '';
    var subject   = amount > 0
        ? 'Mazel Tov! ' + teamName + ' just received a ' + amountStr + ' donation'
        : 'Mazel Tov! ' + teamName + ' just received a donation';

    var html = ''
        + '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1b3148;">'
        +   '<p style="font-size:18px;line-height:1.5;">Mazel tov ' + escapeHtml(teamName) + ',</p>'
        +   '<p style="font-size:16px;line-height:1.6;">'
        +     'Your <strong>Beis Medrash D&rsquo;Jackson 21 Building Campaign</strong> team just received '
        +     (amountStr ? 'a ' + escapeHtml(amountStr) + ' donation' : 'a new donation')
        +     '. Forward the attached thank-you note to your donor when you have a moment.'
        +   '</p>'
        +   '<p style="font-size:14px;color:#888;margin-top:32px;">— Beis Medrash D&rsquo;Jackson 21</p>'
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
        return res.status(200).json({ ok: true, id: data.id });
    } catch (e) {
        return res.status(500).json({ error: 'Send failed', detail: String(e && e.message || e) });
    }
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}
