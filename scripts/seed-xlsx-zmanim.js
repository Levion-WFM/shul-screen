/**
 * Seed daily_zmanim from MyZmanim standard.xlsx (2-year download).
 *
 * Sheet columns (22, 1-based letter):
 *   A CivilDate, B JewishDate, C WkDay, D HolidayHebrew, E HolidayEnglish,
 *   F ParshaHebrew, G ParshaEnglish, H DafYomi, I Omer, J Alos72, K TalisDefault,
 *   L Sunrise, M ShemaMA72, N ShemaGro, O ShachrisGro, P Midday, Q MinchaGroLechumra,
 *   R PlagGro, S Candles, T Sunset, U Tzes3Stars, V Tzes72fix
 *
 * Run: DATABASE_URL=... node scripts/seed-xlsx-zmanim.js [path]
 * Default path: C:/Users/theza/Downloads/standard.xlsx
 *
 * Safe to re-run: everything is ON CONFLICT DO UPDATE keyed on civil_date.
 */

const fs = require('fs');
const XLSX = require('xlsx');
const { neon } = require('@neondatabase/serverless');

function parseDate(usDate) {
  // "4/19/2026" -> "2026-04-19"
  if (!usDate) return null;
  const parts = String(usDate).trim().split('/');
  if (parts.length !== 3) return null;
  const m = parts[0].padStart(2, '0');
  const d = parts[1].padStart(2, '0');
  const y = parts[2];
  return `${y}-${m}-${d}`;
}

function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s ? s : null;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.error('Set DATABASE_URL'); process.exit(1); }

  const xlsxPath = process.argv[2] || 'C:/Users/theza/Downloads/standard.xlsx';
  if (!fs.existsSync(xlsxPath)) { console.error('File not found:', xlsxPath); process.exit(1); }

  const sql = neon(dbUrl);

  // Ensure holiday/parsha/daf columns exist. daily_zmanim already has the time fields.
  console.log('Ensuring schema columns exist...');
  await sql`ALTER TABLE daily_zmanim ADD COLUMN IF NOT EXISTS holiday_hebrew TEXT`;
  await sql`ALTER TABLE daily_zmanim ADD COLUMN IF NOT EXISTS holiday_english TEXT`;
  await sql`ALTER TABLE daily_zmanim ADD COLUMN IF NOT EXISTS parsha_hebrew TEXT`;
  await sql`ALTER TABLE daily_zmanim ADD COLUMN IF NOT EXISTS parsha_english TEXT`;
  await sql`ALTER TABLE daily_zmanim ADD COLUMN IF NOT EXISTS daf_yomi TEXT`;
  await sql`ALTER TABLE daily_zmanim ADD COLUMN IF NOT EXISTS candle_lighting TEXT`;

  console.log('Loading xlsx:', xlsxPath);
  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames[0];
  const sh = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sh, { header: 1, raw: false, defval: '' });
  console.log(`Sheet: ${sheetName}  Rows: ${rows.length - 1} data rows`);

  // Verify headers match
  const expected = [
    'CivilDate','JewishDate','WkDay','HolidayHebrew','HolidayEnglish',
    'ParshaHebrew','ParshaEnglish','DafYomi','Omer','Alos72','TalisDefault',
    'Sunrise','ShemaMA72','ShemaGro','ShachrisGro','Midday','MinchaGroLechumra',
    'PlagGro','Candles','Sunset','Tzes3Stars','Tzes72fix'
  ];
  const actual = rows[0].map(x => String(x).trim());
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      console.error(`Header mismatch col ${i}: expected "${expected[i]}" got "${actual[i]}"`);
      process.exit(1);
    }
  }
  console.log('Headers verified (22 cols).');

  let ok = 0, skip = 0, err = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const civilDate = parseDate(r[0]);
    if (!civilDate) { skip++; continue; }

    const holHe = clean(r[3]);
    const holEn = clean(r[4]);
    const parHe = clean(r[5]);
    const parEn = clean(r[6]);
    const daf   = clean(r[7]);
    const alos72       = clean(r[9]);
    const talis        = clean(r[10]);
    const sunrise      = clean(r[11]);
    const shemaMa      = clean(r[12]);
    const shemaGra     = clean(r[13]);
    const shachrisGra  = clean(r[14]);
    const midday       = clean(r[15]);
    const minchaGedola = clean(r[16]);
    const plag         = clean(r[17]);
    const candles      = clean(r[18]);
    const sunset       = clean(r[19]);
    const tzes3stars   = clean(r[20]);
    const tzes72fix    = clean(r[21]);

    try {
      await sql`
        INSERT INTO daily_zmanim (
          civil_date, alos72, talis, sunrise, shema_ma, shema_gra, shachris_gra,
          midday, mincha_gedola, plag, sunset, tzes_3stars, tzes72fix,
          holiday_hebrew, holiday_english, parsha_hebrew, parsha_english,
          daf_yomi, candle_lighting
        ) VALUES (
          ${civilDate}::date, ${alos72}, ${talis}, ${sunrise}, ${shemaMa},
          ${shemaGra}, ${shachrisGra}, ${midday}, ${minchaGedola}, ${plag},
          ${sunset}, ${tzes3stars}, ${tzes72fix},
          ${holHe}, ${holEn}, ${parHe}, ${parEn}, ${daf}, ${candles}
        )
        ON CONFLICT (civil_date) DO UPDATE SET
          alos72 = EXCLUDED.alos72,
          talis = EXCLUDED.talis,
          sunrise = EXCLUDED.sunrise,
          shema_ma = EXCLUDED.shema_ma,
          shema_gra = EXCLUDED.shema_gra,
          shachris_gra = EXCLUDED.shachris_gra,
          midday = EXCLUDED.midday,
          mincha_gedola = EXCLUDED.mincha_gedola,
          plag = EXCLUDED.plag,
          sunset = EXCLUDED.sunset,
          tzes_3stars = EXCLUDED.tzes_3stars,
          tzes72fix = EXCLUDED.tzes72fix,
          holiday_hebrew = EXCLUDED.holiday_hebrew,
          holiday_english = EXCLUDED.holiday_english,
          parsha_hebrew = EXCLUDED.parsha_hebrew,
          parsha_english = EXCLUDED.parsha_english,
          daf_yomi = EXCLUDED.daf_yomi,
          candle_lighting = EXCLUDED.candle_lighting
      `;
      ok++;
      if (ok % 50 === 0) process.stdout.write(`\r  Upserted ${ok} rows...`);
    } catch (e) {
      err++;
      console.error(`\n  Error on ${civilDate}:`, e.message);
    }
  }

  process.stdout.write('\n');
  console.log(`Done. ok=${ok} skip=${skip} err=${err}`);

  const [min] = await sql`SELECT MIN(civil_date) AS d FROM daily_zmanim`;
  const [max] = await sql`SELECT MAX(civil_date) AS d FROM daily_zmanim`;
  const [ct]  = await sql`SELECT COUNT(*)::int AS c FROM daily_zmanim`;
  console.log(`daily_zmanim range: ${min.d.toISOString().slice(0,10)} → ${max.d.toISOString().slice(0,10)} (${ct.c} rows)`);

  const hols = await sql`
    SELECT civil_date, holiday_hebrew, holiday_english
    FROM daily_zmanim
    WHERE holiday_hebrew IS NOT NULL
    ORDER BY civil_date ASC LIMIT 5
  `;
  console.log('First 5 holidays:');
  hols.forEach(h => console.log(`  ${h.civil_date.toISOString().slice(0,10)}  ${h.holiday_hebrew}  (${h.holiday_english})`));
}

main().catch(err => { console.error(err); process.exit(1); });
