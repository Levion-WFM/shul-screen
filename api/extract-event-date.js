// Uses Claude Sonnet vision to extract the event date from a community flier image.
// POST { imageData: "data:image/...;base64,..." }
// Returns { eventDate: "YYYY-MM-DD" | null, confidence: "high"|"medium"|"low", note: "..." }
// Requires env var ANTHROPIC_API_KEY.

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const CURRENT_YEAR = new Date().getFullYear();

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

    // Same admin-token gate as other write endpoints so random visitors can't burn tokens.
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${adminToken}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    const body = req.body || {};
    const imageData = body.imageData;
    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:')) {
        return res.status(400).json({ error: 'imageData (data URL) required' });
    }
    // Parity with save-data: cap at ~2MB raw data URL to prevent token-burn abuse. The
    // backend compresses fliers to ~50-150KB before sending, so normal traffic is nowhere
    // near this; anything bigger is an attacker or a bug.
    if (imageData.length > 2 * 1024 * 1024) {
        return res.status(413).json({ error: 'Image too large — max 2MB' });
    }

    // data:image/jpeg;base64,AAAA -> { media_type: 'image/jpeg', data: 'AAAA' }
    const match = imageData.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'Invalid data URL' });
    const mediaType = match[1];
    const base64 = match[2];

    // Keep the prompt narrow and structured so parsing is reliable. We don't want prose.
    const prompt = [
        'You are reading a community event flier to determine WHEN the flier should stop being displayed on a kiosk. Be extremely conservative.',
        '',
        'Return eventDate ONLY if ALL of these are true:',
        '1. The flier prints an explicit calendar date (e.g. "May 14, 2026" or "Sun May 14").',
        '2. The month AND day are unambiguous — not just "Sunday" or "this week" or "next month".',
        '3. If the year is missing, it is obvious from context (e.g. upcoming month in current year).',
        '4. You are certain this is THE event date, not a secondary reference (not "submissions due", not a past sponsor date).',
        '',
        'Confidence:',
        '- "high": explicit date printed, no ambiguity, you would bet money on it.',
        '- "medium" or "low": ANY doubt whatsoever — return eventDate as null. Do NOT guess. Do NOT interpolate. Do NOT infer from "this Shabbos" or day-of-week alone.',
        '',
        'Multi-day events: return the LAST day.',
        `If the year is not shown but obvious, assume ${CURRENT_YEAR} unless that month has already passed, in which case ${CURRENT_YEAR + 1}.`,
        '',
        'If you are not 100% certain, return: {"eventDate": null, "confidence": "low", "note": "why you could not commit"}.',
        '',
        'Respond with ONLY a JSON object, no prose, no markdown fences. Schema:',
        '{"eventDate": "YYYY-MM-DD" | null, "confidence": "high" | "medium" | "low", "note": "short explanation of what you saw"}'
    ].join('\n');

    try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 256,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
                        { type: 'text', text: prompt }
                    ]
                }]
            })
        });

        if (!anthropicRes.ok) {
            const errText = await anthropicRes.text();
            console.error('Anthropic API error:', anthropicRes.status, errText);
            return res.status(502).json({ error: 'Upstream vision API error', status: anthropicRes.status });
        }

        const payload = await anthropicRes.json();
        const textBlock = (payload.content || []).find(b => b.type === 'text');
        const rawText = (textBlock && textBlock.text) ? textBlock.text.trim() : '';
        if (!rawText) return res.status(502).json({ error: 'Empty model response' });

        // Tolerate accidental code fences even though we asked for none.
        const jsonStr = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
        let parsed;
        try { parsed = JSON.parse(jsonStr); }
        catch (e) {
            console.error('Could not parse model JSON:', rawText);
            return res.json({ eventDate: null, confidence: 'low', note: 'Could not parse extraction output', raw: rawText });
        }

        // Sanity-normalize
        let eventDate = parsed.eventDate;
        if (typeof eventDate === 'string') {
            eventDate = eventDate.trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) eventDate = null;
        } else {
            eventDate = null;
        }
        const confidence = String(parsed.confidence || 'low').toLowerCase();

        // Server-side guard: only emit a date when the model explicitly says HIGH confidence.
        // Anything else — medium, low, unknown — becomes evergreen (null) so we never
        // auto-remove a flier on shaky evidence. The note is still returned so the user
        // can see what the model saw and enter a date manually if they want.
        const safeDate = (confidence === 'high') ? eventDate : null;

        res.json({
            eventDate: safeDate,
            confidence,
            note: parsed.note || '',
            // Surface the raw candidate so the UI can show "model guessed X but confidence
            // was only medium — enter manually if you want to use it."
            candidateDate: eventDate
        });
    } catch (err) {
        console.error('extract-event-date error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
