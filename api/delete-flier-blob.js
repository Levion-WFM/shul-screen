// POST /api/delete-flier-blob
//
// Best-effort cleanup of an orphaned Vercel Blob. Called when the admin
// removes a flier or replaces its image — without this, the old blob would
// keep occupying storage forever even though no kiosk is referencing it.
//
// Body: { url: "https://...vercel-storage.com/fliers/..." }
//
// Failures are logged and surfaced as 500s, but the admin save flow is
// expected to fire-and-forget this — a stray orphan blob is far less bad
// than blocking a save because the cleanup call timed out.

const { del } = require('@vercel/blob');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });
    }

    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${adminToken}`) {
            return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
        }
    }

    const url = req.body && req.body.url;
    if (typeof url !== 'string' || !url) {
        return res.status(400).json({ error: 'Body must be { url: "..." }' });
    }

    // Only delete blobs we minted. Without this guard, an attacker who
    // somehow obtained the admin token could delete unrelated assets in
    // the same Blob store via this endpoint.
    if (!url.includes('/fliers/')) {
        return res.status(400).json({ error: 'Only flier blobs can be deleted via this endpoint' });
    }

    try {
        await del(url);
        return res.json({ success: true });
    } catch (err) {
        console.error('delete-flier-blob failed:', err);
        return res.status(500).json({ error: 'Delete failed', details: err.message });
    }
};
