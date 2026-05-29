// Batch variant of /api/send-thankyou — accepts up to 30 thank-you sends per
// request and dispatches them concurrently (5 in flight at a time) against the
// Resend API. Same per-recipient behavior as the single-send endpoint:
//   - validates each item
//   - dedups against donation_log
//   - composes the same HTML body + PNG attachment
//   - logs successful sends to donation_log
// Adds:
//   - server-side retry on 429 / 5xx with exponential backoff + jitter
//   - per-item result so the client can show row-level success/failure
//
// Expected POST body (JSON):
//   {
//     items: [
//       { to, teamId?, teamName, donorName?, amount?, imageBase64, donationKey?, force? },
//       ...up to 30
//     ]
//   }
//
// Response:
//   { results: [ { ok: true, id, alreadySent? } | { ok: false, status?, error } ] }
//
// Env vars (same as send-thankyou.js):
//   RESEND_API_KEY, DATABASE_URL, THANKYOU_FROM

const { neon } = require('@neondatabase/serverless');

const MAX_ITEMS = 30;
const CONCURRENCY = 5;
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS = 500;

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    var items = (body && Array.isArray(body.items)) ? body.items : null;
    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in batch' });
    if (items.length > MAX_ITEMS) {
        return res.status(400).json({ error: 'Max ' + MAX_ITEMS + ' items per batch (got ' + items.length + ')' });
    }

    var apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not set on Vercel' });

    var sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
    if (sql) {
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
        } catch (e) { console.error('donation_log preflight failed:', e); }
    }

    // One round-trip to check dedup for every donationKey at once.
    var alreadySent = new Map();
    if (sql) {
        var keys = items.map(function (it) { return (it && it.donationKey) ? String(it.donationKey).trim() : ''; })
                       .filter(function (k) { return k.length > 0; });
        if (keys.length) {
            try {
                var rows = await sql`SELECT donation_key, sent_at FROM donation_log WHERE donation_key = ANY(${keys})`;
                rows.forEach(function (r) { alreadySent.set(r.donation_key, r.sent_at); });
            } catch (e) { console.error('dedup lookup failed:', e); }
        }
    }

    // Concurrent workers drain the queue.
    var results = new Array(items.length);
    var cursor = 0;

    async function worker() {
        while (true) {
            var i = cursor++;
            if (i >= items.length) return;
            results[i] = await sendOne(items[i], apiKey, alreadySent, sql);
        }
    }

    var workers = [];
    for (var w = 0; w < Math.min(CONCURRENCY, items.length); w++) workers.push(worker());
    await Promise.all(workers);

    return res.status(200).json({ results: results });
};

async function sendOne(item, apiKey, alreadySent, sql) {
    try {
        if (!item || typeof item !== 'object') return { ok: false, error: 'Bad item' };

        var to          = (item.to || '').toString().trim();
        var teamName    = (item.teamName || '').toString().trim();
        var donorName   = (item.donorName || '').toString().trim();
        var amount      = Number(item.amount || 0);
        var image       = (item.imageBase64 || '').toString();
        var donationKey = (item.donationKey || '').toString().trim();
        var force       = !!item.force;

        if (!to)       return { ok: false, error: 'Missing `to`' };
        if (!teamName) return { ok: false, error: 'Missing `teamName`' };
        if (!image || image.indexOf('data:image/') !== 0) {
            return { ok: false, error: 'Missing or malformed `imageBase64`' };
        }

        // Dedup short-circuit (pre-checked across the whole batch).
        if (donationKey && !force && alreadySent.has(donationKey)) {
            return { ok: true, alreadySent: true, sentAt: alreadySent.get(donationKey) };
        }

        var base64     = image.replace(/^data:image\/\w+;base64,/, '');
        var recipients = to.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        var amountStr  = amount > 0 ? '$' + amount.toLocaleString('en-US') : '';

        var greeting = teamName ? 'Mazel tov ' + teamName : 'Mazel tov';
        var donorBit = donorName ? ' from ' + donorName : '';
        var subject  = amount > 0
            ? 'Mazel tov! ' + (teamName ? teamName + ' just received a ' + amountStr + ' donation' + donorBit
                                       : 'a ' + amountStr + ' donation' + donorBit + ' just came in')
            : 'Mazel tov! a new donation' + donorBit + (teamName ? ' to ' + teamName + '’s team' : '');

        var html = buildHtml(greeting, teamName, donorName, amountStr);
        var from = process.env.THANKYOU_FROM || 'BMJ21 Building Campaign <onboarding@resend.dev>';

        var payload = JSON.stringify({
            from: from,
            to: recipients,
            subject: subject,
            html: html,
            attachments: [{
                filename: 'thank-you-' + slug(teamName) + '.png',
                content: base64
            }]
        });

        // Retry transient failures (rate limit / 5xx).
        var r, data, lastError = null;
        for (var attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
            try {
                r = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: payload
                });
                data = await r.json().catch(function () { return {}; });
                if (r.ok) break;
                lastError = data;
                // Non-retryable: client errors that are our fault
                if (r.status >= 400 && r.status < 500 && r.status !== 429) {
                    return { ok: false, status: r.status, error: extractErrorMessage(data) };
                }
                // Retryable: rate-limit or 5xx
                if (attempt < RETRY_ATTEMPTS) {
                    var backoff = Math.pow(2, attempt) * RETRY_BASE_MS + Math.random() * RETRY_BASE_MS;
                    await sleep(backoff);
                }
            } catch (e) {
                lastError = { message: String(e && e.message || e) };
                if (attempt < RETRY_ATTEMPTS) {
                    var backoff = Math.pow(2, attempt) * RETRY_BASE_MS + Math.random() * RETRY_BASE_MS;
                    await sleep(backoff);
                } else {
                    return { ok: false, error: lastError.message };
                }
            }
        }

        if (!r || !r.ok) {
            return { ok: false, status: r ? r.status : 0, error: extractErrorMessage(lastError) };
        }

        // Log only after success.
        if (sql && donationKey) {
            try {
                await sql`
                    INSERT INTO donation_log (donation_key, team_id, team_name, amount, recipient, sent_at)
                    VALUES (${donationKey}, ${String(item.teamId || '')}, ${teamName}, ${amount}, ${to}, NOW())
                    ON CONFLICT (donation_key) DO UPDATE SET sent_at = NOW(), recipient = EXCLUDED.recipient
                `;
            } catch (e) { console.error('donation_log insert failed:', e); }
        }

        return { ok: true, id: data.id };
    } catch (e) {
        return { ok: false, error: String(e && e.message || e) };
    }
}

function buildHtml(greeting, teamName, donorName, amountStr) {
    return '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1b3148;">'
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
}

function extractErrorMessage(data) {
    if (!data) return 'Unknown error';
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error && data.error.message) return data.error.message;
    if (data.error) return String(data.error);
    return JSON.stringify(data);
}
function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}
function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
}
