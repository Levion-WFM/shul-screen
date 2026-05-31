// Sends a raffle-entry confirmation email and logs the entries to Neon.
//
// POST body (JSON):
//   {
//     to:           "donor@example.com"
//     donorName:    "Shlomo Broyde"        (used in greeting)
//     teamName:     "Binyomin & Sora Bak"  (raiser, used in context line)
//     amount:       18                     (the original donation amount)
//     donationKey:  "charge:ch_3Tc..."     (links the raffle log to the donation)
//     entries:      [ { prize, tickets }, ... ]   prize must be one of
//                                                  the allowed slugs below
//     force:        true                   (resend, skip the prior-send guard)
//     demoMode:     true                   (skip DB write so demos don't pollute)
//   }
//
// Env vars: RESEND_API_KEY (required), DATABASE_URL (recommended for logging),
// THANKYOU_FROM (optional, falls back to onboarding@resend.dev).

const { neon } = require('@neondatabase/serverless');

// Allowed raffle prizes. Add new ones here as the campaign offers more.
const PRIZES = {
    yam_suf_painting:     'Yam Suf Painting',
    jerusalem_painting:   'Jerusalem Painting'
};

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    var to          = (body.to || '').toString().trim();
    var donorName   = (body.donorName || '').toString().trim();
    var teamName    = (body.teamName || '').toString().trim();
    var amount      = Number(body.amount || 0);
    var donationKey = (body.donationKey || '').toString().trim();
    var demoMode    = !!body.demoMode;
    var force       = !!body.force;
    var image       = (body.imageBase64 || '').toString();

    if (!to)             return res.status(400).json({ error: 'Missing `to`' });
    if (!Array.isArray(body.entries) || !body.entries.length) {
        return res.status(400).json({ error: 'Missing `entries` — provide at least one raffle entry' });
    }

    // Normalize + validate entries. Tickets must be a positive integer.
    var entries = [];
    for (var i = 0; i < body.entries.length; i++) {
        var e = body.entries[i] || {};
        var slug = String(e.prize || '').trim();
        var tickets = parseInt(e.tickets, 10) || 0;
        if (!PRIZES[slug])    return res.status(400).json({ error: 'Unknown prize: ' + slug });
        if (tickets <= 0)     continue;   // silently drop zero-ticket lines
        entries.push({ slug: slug, label: PRIZES[slug], tickets: tickets });
    }
    if (!entries.length) return res.status(400).json({ error: 'All entries had zero tickets' });

    var apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not set on Vercel' });

    // Dedup: same donationKey + same prize set already sent? Skip unless force.
    var sql = null;
    if (!demoMode && donationKey && process.env.DATABASE_URL) {
        sql = neon(process.env.DATABASE_URL);
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS raffle_entries (
                    id             SERIAL PRIMARY KEY,
                    donation_key   TEXT,
                    prize          TEXT,
                    tickets        INT,
                    recipient      TEXT,
                    sent_at        TIMESTAMPTZ DEFAULT NOW()
                )
            `;
            if (!force) {
                var existing = await sql`
                    SELECT prize FROM raffle_entries WHERE donation_key = ${donationKey}
                `;
                if (existing.length) {
                    return res.status(200).json({
                        ok: true,
                        alreadySent: true,
                        previous: existing.map(function(r) { return r.prize; })
                    });
                }
            }
        } catch (e) {
            console.error('raffle_entries preflight failed:', e);
        }
    }

    // Compose the email.
    var recipients = to.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    var totalTickets = entries.reduce(function(s, e) { return s + e.tickets; }, 0);
    var greeting = donorName ? 'Dear ' + donorName : 'Thank you again';
    var subject = 'Your raffle entries — BMJ21 Building Campaign';
    var amountStr = amount > 0 ? '$' + amount.toLocaleString('en-US') : '';

    var entriesHtml = entries.map(function(e) {
        return '<tr>'
            + '<td style="padding:8px 16px;border-bottom:1px solid #e2e8f0;color:#1b3148;">' + escapeHtml(e.label) + '</td>'
            + '<td style="padding:8px 16px;border-bottom:1px solid #e2e8f0;color:#1b3148;text-align:right;font-weight:bold;">' + e.tickets + ' ticket' + (e.tickets === 1 ? '' : 's') + '</td>'
            + '</tr>';
    }).join('');

    var html = ''
        + '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1b3148;">'
        +   '<p style="font-size:18px;line-height:1.5;">' + escapeHtml(greeting) + ',</p>'
        +   '<p style="font-size:16px;line-height:1.6;">'
        +     'On top of our heartfelt thanks for your '
        +     (amountStr ? '<strong>' + escapeHtml(amountStr) + '</strong> ' : '')
        +     'donation to the <strong>Beis Medrash D&rsquo;Jackson 21 Building Campaign</strong>'
        +     (teamName ? ', through ' + escapeHtml(teamName) + '’s team' : '')
        +     ', we are happy to confirm your entries in our raffle drawings:'
        +   '</p>'
        +   '<table style="width:100%;border-collapse:collapse;margin:18px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">'
        +     '<thead><tr>'
        +       '<th style="padding:10px 16px;text-align:left;background:#1b3148;color:#fff;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Raffle</th>'
        +       '<th style="padding:10px 16px;text-align:right;background:#1b3148;color:#fff;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Tickets</th>'
        +     '</tr></thead>'
        +     '<tbody>' + entriesHtml + '</tbody>'
        +     '<tfoot><tr>'
        +       '<td style="padding:10px 16px;font-weight:bold;color:#1b3148;">Total</td>'
        +       '<td style="padding:10px 16px;font-weight:bold;color:#1b3148;text-align:right;">' + totalTickets + ' ticket' + (totalTickets === 1 ? '' : 's') + '</td>'
        +     '</tr></tfoot>'
        +   '</table>'
        +   '<p style="font-size:15px;line-height:1.6;color:#334155;">We&rsquo;ll be in touch when the drawings happen. Best of luck!</p>'
        +   '<p style="font-size:14px;color:#888;margin-top:32px;">With gratitude,<br/>Beis Medrash D&rsquo;Jackson 21</p>'
        + '</div>';

    var from = process.env.THANKYOU_FROM || 'BMJ21 Building Campaign <onboarding@resend.dev>';

    // Optional PNG attachment: when the page renders a raffle variant of the
    // thank-you card (donor name + amount + ticket lines), attach it so the
    // donor's email shows the same visual, not just the HTML table.
    var attachments = [];
    if (image.indexOf('data:image/') === 0) {
        var b64 = image.replace(/^data:image\/\w+;base64,/, '');
        var slug = String(donorName || 'donor').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
        attachments.push({
            filename: 'raffle-' + (slug || 'entry') + '.jpg',
            content: b64
        });
    }

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
                attachments: attachments
            })
        });
        var data = await r.json();
        if (!r.ok) {
            return res.status(r.status).json({ error: 'Resend error', detail: data });
        }

        // Log the entries only after a successful send and only outside demo mode.
        if (sql && !demoMode && donationKey) {
            try {
                // If force=true, clear any prior entries for this donation_key so the
                // log reflects the latest send only. Otherwise duplicate sends won't
                // happen because of the preflight guard above.
                if (force) {
                    await sql`DELETE FROM raffle_entries WHERE donation_key = ${donationKey}`;
                }
                for (var j = 0; j < entries.length; j++) {
                    var e = entries[j];
                    await sql`
                        INSERT INTO raffle_entries (donation_key, prize, tickets, recipient, sent_at)
                        VALUES (${donationKey}, ${e.slug}, ${e.tickets}, ${to}, NOW())
                    `;
                }
            } catch (e) {
                console.error('raffle_entries insert failed:', e);
            }
        }

        return res.status(200).json({ ok: true, id: data.id, totalTickets: totalTickets });
    } catch (e) {
        return res.status(500).json({ error: 'Send failed', detail: String(e && e.message || e) });
    }
};

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
