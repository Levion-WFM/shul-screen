const { neon } = require('@neondatabase/serverless');

// POST /api/campaign-import
// Replaces the campaign_pledges table from a CharityExtra teams export and
// bumps the kiosk reload nonce so running screens pick up new amounts (~30s).
//
// Body: { teams: [ { team_id, name, goal, raised, hidden } ] }
//   - The upload page (campaign.html) parses the CSV client-side (PapaParse)
//     and posts clean JSON, so this endpoint does no CSV parsing.
//   - Full-refresh semantics: teams not present in the upload are removed,
//     so a fresh export is the source of truth.
//
// Auth: same admin Bearer token as save-data / force-reload (ADMIN_TOKEN).
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Server configuration error' });

    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${adminToken}`) {
            return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
        }
    }

    // Accept { teams: [...] } or a bare array.
    const body = req.body || {};
    const incoming = Array.isArray(body) ? body : body.teams;
    if (!Array.isArray(incoming) || incoming.length === 0) {
        return res.status(400).json({ error: 'Expected a non-empty "teams" array' });
    }

    // Validate + normalize. Skip rows without a numeric team_id and a name.
    function toInt(v) {
        const n = parseInt(String(v == null ? '' : v).replace(/[^0-9.-]/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    }
    const teams = [];
    const seen = new Set();
    for (const r of incoming) {
        const teamId = toInt(r.team_id);
        const name = String(r.name == null ? '' : r.name).replace(/\s+/g, ' ').trim();
        if (!teamId || !name || seen.has(teamId)) continue;
        seen.add(teamId);
        teams.push({
            team_id: teamId,
            name: name,
            goal: Math.max(0, toInt(r.goal)),
            raised: Math.max(0, toInt(r.raised)),
            hidden: r.hidden === true || /^(yes|true|1)$/i.test(String(r.hidden || '')),
        });
    }
    if (teams.length === 0) {
        return res.status(400).json({ error: 'No valid rows (need numeric team_id + name)' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const nonce = Date.now();
        const ids = teams.map((t) => t.team_id);

        const queries = teams.map((t) => sql`
            INSERT INTO campaign_pledges (team_id, name, goal, raised, hidden, updated_at)
            VALUES (${t.team_id}, ${t.name}, ${t.goal}, ${t.raised}, ${t.hidden}, NOW())
            ON CONFLICT (team_id) DO UPDATE SET
                name = EXCLUDED.name, goal = EXCLUDED.goal, raised = EXCLUDED.raised,
                hidden = EXCLUDED.hidden, updated_at = NOW()
        `);

        // Remove teams that are no longer in the export (full refresh).
        queries.push(sql`DELETE FROM campaign_pledges WHERE team_id <> ALL(${ids}::bigint[])`);

        // Bump reload nonce — same mechanism as force-reload, so kiosks reload
        // on their next poll and render the new numbers.
        queries.push(sql`
            INSERT INTO screen_data (id, data, updated_at)
            VALUES (1, ${JSON.stringify({ reloadNonce: nonce })}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE
            SET data = jsonb_set(
                COALESCE(screen_data.data, '{}'::jsonb),
                '{reloadNonce}',
                to_jsonb(${nonce}::bigint)
            ),
            updated_at = NOW()
        `);

        await sql.transaction(queries);

        const totalGoal = teams.reduce((s, t) => s + t.goal, 0);
        const totalRaised = teams.reduce((s, t) => s + t.raised, 0);
        res.json({
            success: true,
            teams: teams.length,
            raisedTeams: teams.filter((t) => t.raised > 0).length,
            totalGoal,
            totalRaised,
            reloadNonce: nonce,
        });
    } catch (err) {
        console.error('campaign-import error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
