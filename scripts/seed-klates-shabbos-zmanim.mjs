/**
 * Seed shabbos_zmanim from the gabbai's klates workbook:
 *   C:/Users/theza/Downloads/זמנים תשפ_ה.xlsx    (Hebrew parsha + shul times)
 *
 * Shabbos-date lookup source:
 *   C:/Users/theza/Downloads/standard.xlsx       (MyZmanim; authoritative dates)
 *
 * Four seasonal sheets in the klates file:
 *   Winter 5785, Winter 5786   — 12 cols, single mincha erev shabbos
 *   Summer 5785                — 15 cols, single mincha erev shabbos + plag
 *   Summer 5786                — 16 cols, SPLIT mincha (מנחה א early, מנחה ב late) + plag
 *
 * Column positions vary between sheets — we auto-detect them from the header row
 * (row index 2) rather than hard-coding. Date cells in the sheet are unreliable
 * (summer 5786 still shows 5785 dates) — we resolve parsha → Shabbos date from
 * standard.xlsx instead. standard.xlsx covers ~2 years forward, so past-week rows
 * in the klates sheet will be SKIPPED (which is desired — we only care about
 * current and future weeks).
 *
 * Schema change: adds `mincha_a TEXT` column if missing. Existing column
 * `mincha_erev_shabbos` keeps its meaning and now holds:
 *   - "מנחה ב" (the later option)     when summer-split rows are imported
 *   - the sole "מנחה ערב שבת" value    for all other rows (winter + old summer)
 *
 * Usage:
 *   DATABASE_URL=... node scripts/seed-klates-shabbos-zmanim.mjs [--dry-run]
 */

import XLSX from 'xlsx';
import { neon } from '@neondatabase/serverless';

const DRY = process.argv.includes('--dry-run');
const klatesPath = process.argv.find(a => a.endsWith('.xlsx') && a.includes('ה'))
    || 'C:/Users/theza/Downloads/זמנים תשפ_ה.xlsx';
const standardPath = 'C:/Users/theza/Downloads/standard.xlsx';

// Normalize a Hebrew parsha name for matching.
//   - strip "פרשת" / "פרשיות" prefix
//   - keep only Hebrew letter chars (drops spaces, hyphens, dashes, geresh, etc.)
function normHebrew(s) {
    return String(s || '')
        .replace(/פרש(ת|יות)/g, '')
        .replace(/[^א-ת]/g, '');
}

// Remove matres lectionis (ו, י) — handles spelling variants like בחקתי↔בחוקתי.
function normLoose(s) {
    return normHebrew(s).replace(/[וי]/g, '');
}

function clean(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s ? s : null;
}

function detectColumnExact(headerRow, candidates) {
    for (let c = 0; c < headerRow.length; c++) {
        const h = String(headerRow[c] || '').trim();
        if (candidates.includes(h)) return c;
    }
    return -1;
}

function detectParshaColumn(aoa, claimed) {
    // Parsha column: many Hebrew cells, zero time-formatted cells.
    const timeRe = /^\d{1,2}:\d{2}/;
    const hebRe = /[֐-׿]/;
    const ncols = Math.max(...aoa.map(r => r.length));
    let bestCol = -1, bestScore = 0;
    for (let c = 0; c < ncols; c++) {
        if (claimed.has(c)) continue;
        let heb = 0, time = 0, total = 0;
        for (let r = 3; r < aoa.length; r++) {
            const v = String(aoa[r][c] || '').trim();
            if (!v) continue;
            total++;
            if (timeRe.test(v)) time++;
            else if (hebRe.test(v)) heb++;
        }
        if (total < 3 || time > 0) continue;
        const score = heb / total;
        if (score > bestScore) { bestScore = score; bestCol = c; }
    }
    return bestCol;
}

// Parse "M/D/YYYY" or "MM/DD/YYYY" → "YYYY-MM-DD".
function parseUsDate(s) {
    if (!s) return null;
    const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!m) return null;
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    const mo = String(m[1]).padStart(2, '0');
    const d  = String(m[2]).padStart(2, '0');
    return `${y}-${mo}-${d}`;
}

// Build lookup maps from standard.xlsx: parsha-key → Saturday ISO date.
// Indexes:
//   exactMap:  normHebrew → date (first occurrence)
//   looseMap:  normLoose  → date
//   halfMap:   normHebrew(each half of doubled parsha) → date
// Later occurrences are NOT overwritten — first match (earliest Saturday) wins.
function buildStandardLookups() {
    console.log(`Loading MyZmanim date source: ${standardPath}`);
    const wb = XLSX.readFile(standardPath);
    const sh = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json(sh, { header: 1, raw: false, defval: '' });

    const headers = aoa[0].map(h => String(h).trim());
    const cCivil = headers.indexOf('CivilDate');
    const cWkDay = headers.indexOf('WkDay');
    const cParHe = headers.indexOf('ParshaHebrew');
    if (cCivil < 0 || cWkDay < 0 || cParHe < 0) {
        throw new Error(`standard.xlsx missing expected columns (CivilDate/WkDay/ParshaHebrew)`);
    }

    const exactMap = new Map();
    const looseMap = new Map();
    const halfMap  = new Map();
    let satRows = 0;

    for (let i = 1; i < aoa.length; i++) {
        const r = aoa[i];
        const wkday = String(r[cWkDay] || '').toLowerCase();
        if (!wkday.startsWith('sha')) continue;  // only Saturdays
        const parshaRaw = String(r[cParHe] || '').trim();
        if (!parshaRaw) continue;
        const iso = parseUsDate(r[cCivil]);
        if (!iso) continue;
        satRows++;

        const keyFull  = normHebrew(parshaRaw);
        const keyLoose = normLoose(parshaRaw);
        if (!exactMap.has(keyFull))  exactMap.set(keyFull, iso);
        if (!looseMap.has(keyLoose)) looseMap.set(keyLoose, iso);

        // Split doubled parshas on dashes/hyphens/spaces and index each half.
        const halves = parshaRaw
            .replace(/פרש(ת|יות)?/g, '')
            .split(/[^א-ת]+/)
            .filter(Boolean);
        // If the original name had a split character (hyphen/dash), treat halves as
        // distinct parshiyos. If it was just space-separated ("לך לך"), DON'T split —
        // treating each word as a separate parsha produces wrong lookups.
        if (/[-־–—]/.test(parshaRaw)) {
            for (const h of halves) {
                const hk = normHebrew(h);
                if (hk && !halfMap.has(hk)) halfMap.set(hk, iso);
                const hkL = normLoose(h);
                if (hkL && !halfMap.has(hkL)) halfMap.set(hkL, iso);
            }
        }
    }

    console.log(`  standard.xlsx: ${satRows} Saturday-parsha rows indexed`);
    console.log(`  exact keys: ${exactMap.size}  loose keys: ${looseMap.size}  halves: ${halfMap.size}`);
    return { exactMap, looseMap, halfMap };
}

function lookupParsha(parshaRaw, lookups) {
    const { exactMap, looseMap, halfMap } = lookups;
    const kFull = normHebrew(parshaRaw);
    if (exactMap.has(kFull)) return { date: exactMap.get(kFull), via: 'exact' };
    const kLoose = normLoose(parshaRaw);
    if (looseMap.has(kLoose)) return { date: looseMap.get(kLoose), via: 'loose' };
    // Try each half if parsha has a separator.
    // Handles both cases:
    //   - doubled parsha in klates that's ALSO doubled in standard.xlsx (matches halfMap)
    //   - klates with shabbos-name suffix like "דברים - חזון" (חזון isn't a parsha;
    //     דברים matches exactMap as a single)
    if (/[-־–—]/.test(parshaRaw)) {
        const halves = parshaRaw
            .replace(/פרש(ת|יות)?/g, '')
            .split(/[^א-ת]+/)
            .filter(Boolean);
        for (const h of halves) {
            const hk = normHebrew(h);
            if (halfMap.has(hk)) return { date: halfMap.get(hk), via: `half(${h})` };
            if (exactMap.has(hk)) return { date: exactMap.get(hk), via: `exactHalf(${h})` };
            const hkL = normLoose(h);
            if (halfMap.has(hkL)) return { date: halfMap.get(hkL), via: `halfLoose(${h})` };
            if (looseMap.has(hkL)) return { date: looseMap.get(hkL), via: `looseHalf(${h})` };
        }
    }
    return null;
}

async function main() {
    const lookups = buildStandardLookups();

    console.log(`\nLoading klates: ${klatesPath}`);
    const wb = XLSX.readFile(klatesPath);

    // Only Summer 5786 is current/future (Apr–Sep 2026) and has the new Mincha A/B split.
    // Older sheets (Winter 5785, Summer 5785, Winter 5786) hold past-year times that
    // would get misaligned to next-year's parsha occurrence in standard.xlsx — so skip.
    // Each sheet also gets a date window: matched dates must fall inside it, otherwise
    // the parsha resolved to the wrong-year occurrence (e.g., Shemini 5786 → next year's).
    const sheetConfig = {
        'Summer 5786': { dateMin: '2026-04-01', dateMax: '2026-10-15' },
    };
    const extraSheets = process.argv
        .filter(a => a.startsWith('--sheet='))
        .map(a => a.slice('--sheet='.length));
    for (const name of extraSheets) {
        if (!sheetConfig[name]) sheetConfig[name] = { dateMin: null, dateMax: null };
    }
    const sheetNames = Object.keys(sheetConfig);
    const allRows = [];
    const warnings = [];

    // Sanity: flag times that fall far outside expected Shabbos zmanim windows.
    // Not used for filtering — just surfaces obvious typos in the klates sheet.
    function parseClockMin(s) {
        const m = String(s || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
        if (!m) return null;
        let h = parseInt(m[1], 10);
        const mn = parseInt(m[2], 10);
        const ap = (m[3] || '').toUpperCase();
        if (ap === 'PM' && h < 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        return h * 60 + mn;
    }
    function flagIfOutside(label, value, lo, hi) {
        const t = parseClockMin(value);
        if (t == null) return null;
        // Field comes in without AM/PM. Interpret bare hours 1-11 as PM for evening fields.
        let pm = t;
        if (!/AM|PM/i.test(value)) pm = t + (t < 12 * 60 && t < lo ? 12 * 60 : 0);
        if (pm < lo || pm > hi) return `${label}=${value}`;
        return null;
    }

    for (const sheetName of sheetNames) {
        const cfg = sheetConfig[sheetName] || {};
        if (!wb.Sheets[sheetName]) {
            warnings.push(`Sheet "${sheetName}" not found, skipping.`);
            continue;
        }
        const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
            header: 1, raw: false, defval: ''
        });
        const headerRow = aoa[2] || [];

        const c_maariv       = detectColumnExact(headerRow, ['מעריב']);
        const c_minShabbos   = detectColumnExact(headerRow, ['מנחה']);
        const c_shacharit    = detectColumnExact(headerRow, ['שחרית']);
        const c_candles      = detectColumnExact(headerRow, ['הדלקת נרות']);
        // Summer 5786 uses "מנחה ב" (the late option); all other sheets use "מנחה ערב שבת" as the single mincha.
        const c_minB         = detectColumnExact(headerRow, ['מנחה ב', 'מנחה ערב שבת']);
        const c_minA         = detectColumnExact(headerRow, ['מנחה א']);

        const claimed = new Set(
            [c_maariv, c_minShabbos, c_shacharit, c_candles, c_minB, c_minA]
            .filter(c => c >= 0)
        );
        const c_parsha = detectParshaColumn(aoa, claimed);

        console.log(`\n[${sheetName}]`);
        console.log(`  headers: ${JSON.stringify(headerRow.filter(Boolean))}`);
        console.log(`  cols: maariv=${c_maariv} mincha_shabbos=${c_minShabbos}`
            + ` shacharit=${c_shacharit} candles=${c_candles}`
            + ` mincha_b=${c_minB} mincha_a=${c_minA} parsha=${c_parsha}`);

        if (c_minB < 0) warnings.push(`[${sheetName}] no "מנחה ב"/"מנחה ערב שבת" column detected`);
        if (c_parsha < 0) { warnings.push(`[${sheetName}] no parsha column detected`); continue; }

        let parsed = 0, skipped = 0;
        for (let r = 3; r < aoa.length; r++) {
            const row = aoa[r];
            const parshaRaw = String(row[c_parsha] || '').trim();
            if (!parshaRaw) continue;

            // Skip rows with no time data (stray text-only rows)
            const anyTime = [c_maariv, c_minShabbos, c_shacharit, c_candles, c_minB, c_minA]
                .filter(c => c >= 0)
                .some(c => clean(row[c]));
            if (!anyTime) continue;

            const hit = lookupParsha(parshaRaw, lookups);
            if (!hit) {
                skipped++;
                warnings.push(`[${sheetName} R${r+1}] parsha "${parshaRaw}" — no future date in standard.xlsx (likely past week, skipped)`);
                continue;
            }
            if (cfg.dateMin && hit.date < cfg.dateMin) {
                skipped++;
                warnings.push(`[${sheetName} R${r+1}] parsha "${parshaRaw}" → ${hit.date} is before ${cfg.dateMin} (sheet window, skipped)`);
                continue;
            }
            if (cfg.dateMax && hit.date > cfg.dateMax) {
                skipped++;
                warnings.push(`[${sheetName} R${r+1}] parsha "${parshaRaw}" → ${hit.date} is after ${cfg.dateMax} — would have mapped to next-year occurrence, skipped`);
                continue;
            }

            // Flag values that are way outside expected Shabbos windows (catches typos in the sheet).
            // Candles, mincha erev, mincha shabbos: afternoon 2:30 PM-8:30 PM  (14:30-20:30 = 870-1230)
            // Shacharis: morning 7:00-10:00 AM (420-600)
            // Maariv: evening 5:00-10:30 PM (1020-1350)
            const anomalies = [];
            const a1 = flagIfOutside('candles', row[c_candles], 14*60+30, 20*60+30); if (a1) anomalies.push(a1);
            const a2 = flagIfOutside('mincha_a', c_minA >= 0 ? row[c_minA] : null, 14*60+30, 20*60+30); if (a2) anomalies.push(a2);
            const a3 = flagIfOutside('mincha_b', row[c_minB], 14*60+30, 20*60+30); if (a3) anomalies.push(a3);
            const a4 = flagIfOutside('mincha_shabbos', row[c_minShabbos], 14*60+30, 20*60+30); if (a4) anomalies.push(a4);
            const a5 = flagIfOutside('maariv', row[c_maariv], 17*60, 22*60+30); if (a5) anomalies.push(a5);
            // shacharis: bare hour → AM
            const shach = String(row[c_shacharit] || '').trim();
            if (shach) {
                const t = parseClockMin(shach);
                if (t != null && (t < 7*60 || t > 10*60+30)) anomalies.push(`shacharis=${shach}`);
            }
            if (anomalies.length) {
                warnings.push(`[${sheetName} R${r+1}] ${parshaRaw} — SUSPICIOUS VALUES (likely typo): ${anomalies.join(', ')}`);
            }

            allRows.push({
                shabbos_date: hit.date,
                parsha: parshaRaw,
                mincha_a: c_minA >= 0 ? clean(row[c_minA]) : null,
                mincha_erev_shabbos: clean(row[c_minB]),
                shacharit: clean(row[c_shacharit]),
                mincha_shabbos: clean(row[c_minShabbos]),
                maariv: clean(row[c_maariv]),
                candle_lighting: clean(row[c_candles]),
                _sheet: sheetName,
                _origRow: r + 1,
                _via: hit.via,
            });
            parsed++;
        }
        console.log(`  → matched ${parsed}, skipped ${skipped}`);
    }

    // Dedupe by shabbos_date: iteration order is Winter 5785 → Winter 5786 → Summer 5785 → Summer 5786.
    // If a future date appears in more than one sheet, the LAST one wins — so Summer 5786's
    // split-mincha data overrides any earlier sheet's single-mincha data for the same date.
    const byDate = new Map();
    for (const r of allRows) {
        const prev = byDate.get(r.shabbos_date);
        if (prev) {
            warnings.push(`Duplicate shabbos_date ${r.shabbos_date}:`
                + ` [${prev._sheet} R${prev._origRow}] vs [${r._sheet} R${r._origRow}] — keeping ${r._sheet}`);
        }
        byDate.set(r.shabbos_date, r);
    }
    const deduped = Array.from(byDate.values())
        .sort((a, b) => a.shabbos_date.localeCompare(b.shabbos_date));

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total matched rows: ${allRows.length}`);
    console.log(`Unique Shabbos dates: ${deduped.length}`);
    const withA = deduped.filter(r => r.mincha_a);
    console.log(`Rows with mincha_a (early): ${withA.length}`);

    if (warnings.length) {
        console.log(`\n=== WARNINGS (${warnings.length}) ===`);
        warnings.forEach(w => console.log('  ' + w));
    }

    console.log(`\n=== ALL ROWS TO IMPORT ===`);
    for (const r of deduped) {
        const a = r.mincha_a ? `  minA=${r.mincha_a}` : '';
        console.log(`  ${r.shabbos_date} ${r.parsha}  cand=${r.candle_lighting}${a}  minB=${r.mincha_erev_shabbos}  shachris=${r.shacharit}  minchaShab=${r.mincha_shabbos}  maariv=${r.maariv}  [${r._sheet} R${r._origRow}, ${r._via}]`);
    }

    if (DRY) {
        console.log('\n--dry-run: not writing to DB.');
        return;
    }

    if (!process.env.DATABASE_URL) {
        console.error('\nDATABASE_URL not set — cannot write.');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    console.log('\nEnsuring mincha_a column exists...');
    await sql`ALTER TABLE shabbos_zmanim ADD COLUMN IF NOT EXISTS mincha_a TEXT`;

    let ok = 0, err = 0;
    for (const r of deduped) {
        try {
            await sql`
                INSERT INTO shabbos_zmanim
                    (shabbos_date, parsha, candle_lighting, mincha_a,
                     mincha_erev_shabbos, shacharit, mincha_shabbos, maariv)
                VALUES
                    (${r.shabbos_date}::date, ${r.parsha}, ${r.candle_lighting},
                     ${r.mincha_a}, ${r.mincha_erev_shabbos}, ${r.shacharit},
                     ${r.mincha_shabbos}, ${r.maariv})
                ON CONFLICT (shabbos_date) DO UPDATE SET
                    parsha = EXCLUDED.parsha,
                    candle_lighting = EXCLUDED.candle_lighting,
                    mincha_a = EXCLUDED.mincha_a,
                    mincha_erev_shabbos = EXCLUDED.mincha_erev_shabbos,
                    shacharit = EXCLUDED.shacharit,
                    mincha_shabbos = EXCLUDED.mincha_shabbos,
                    maariv = EXCLUDED.maariv
            `;
            ok++;
        } catch (e) {
            err++;
            console.error(`  Error on ${r.shabbos_date}:`, e.message);
        }
    }
    console.log(`\nUpsert complete: ok=${ok} err=${err}`);

    // Read back for sanity
    const check = await sql`
        SELECT shabbos_date, parsha, mincha_a, mincha_erev_shabbos,
               shacharit, mincha_shabbos, maariv, candle_lighting
        FROM shabbos_zmanim
        WHERE shabbos_date >= CURRENT_DATE
        ORDER BY shabbos_date
        LIMIT 10
    `;
    console.log('\n=== DB round-trip (next 10 upcoming) ===');
    for (const s of check) {
        const d = s.shabbos_date instanceof Date ? s.shabbos_date.toISOString().slice(0,10) : s.shabbos_date;
        const a = s.mincha_a ? ` | A=${s.mincha_a}` : '';
        console.log(`  ${d} ${s.parsha} | cand=${s.candle_lighting}${a} | B=${s.mincha_erev_shabbos} | shachris=${s.shacharit} | minchaShab=${s.mincha_shabbos} | maariv=${s.maariv}`);
    }
}

main().catch(err => { console.error(err); process.exit(1); });
