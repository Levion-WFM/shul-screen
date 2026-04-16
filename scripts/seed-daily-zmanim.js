/**
 * Seed daily_zmanim from MyZmanim CSV export.
 * Run: node scripts/seed-daily-zmanim.js
 * Requires DATABASE_URL env var.
 */

const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

function parseDate(usDate) {
  // Input: "9/4/2025" -> "2025-09-04"
  const parts = usDate.split('/');
  if (parts.length !== 3) return null;
  const m = parts[0].padStart(2, '0');
  const d = parts[1].padStart(2, '0');
  const y = parts[2];
  return `${y}-${m}-${d}`;
}

function cleanTime(t) {
  // Strip whitespace, return null if empty
  if (!t || !t.trim()) return null;
  return t.trim();
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.error('Set DATABASE_URL'); process.exit(1); }

  const sql = neon(dbUrl);
  const csvPath = process.argv[2] || 'C:\\Users\\theza\\Downloads\\Zmanim - myzmanim.csv';
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());

  // Skip header
  let total = 0;
  for (let i = 1; i < lines.length; i++) {
    // Parse CSV respecting potential commas in fields
    const cols = lines[i].split(',');
    if (cols.length < 26) continue;

    const civilDate = parseDate(cols[0]);
    if (!civilDate) continue;

    // Columns: J=10, L=12, M=13, N=14, P=16, Q=17, R=18, S=19, U=21, W=23, X=24, Z=26
    // (0-indexed: J=9, L=11, M=12, N=13, P=15, Q=16, R=17, S=18, U=20, W=22, X=23, Z=25)
    const alos72 = cleanTime(cols[9]);
    const talis = cleanTime(cols[11]);
    const sunrise = cleanTime(cols[12]);
    const shemaMa = cleanTime(cols[13]);
    const shemaGra = cleanTime(cols[15]);
    const shachrisGra = cleanTime(cols[16]);
    const midday = cleanTime(cols[17]);
    const minchaGedola = cleanTime(cols[18]);
    const plag = cleanTime(cols[20]);
    const sunset = cleanTime(cols[22]);
    const tzes3stars = cleanTime(cols[23]);
    const tzes72fix = cleanTime(cols[25]);

    try {
      await sql`
        INSERT INTO daily_zmanim (civil_date, alos72, talis, sunrise, shema_ma, shema_gra, shachris_gra, midday, mincha_gedola, plag, sunset, tzes_3stars, tzes72fix)
        VALUES (${civilDate}::date, ${alos72}, ${talis}, ${sunrise}, ${shemaMa}, ${shemaGra}, ${shachrisGra}, ${midday}, ${minchaGedola}, ${plag}, ${sunset}, ${tzes3stars}, ${tzes72fix})
        ON CONFLICT (civil_date) DO UPDATE SET
          alos72 = EXCLUDED.alos72, talis = EXCLUDED.talis, sunrise = EXCLUDED.sunrise,
          shema_ma = EXCLUDED.shema_ma, shema_gra = EXCLUDED.shema_gra, shachris_gra = EXCLUDED.shachris_gra,
          midday = EXCLUDED.midday, mincha_gedola = EXCLUDED.mincha_gedola, plag = EXCLUDED.plag,
          sunset = EXCLUDED.sunset, tzes_3stars = EXCLUDED.tzes_3stars, tzes72fix = EXCLUDED.tzes72fix
      `;
      total++;
      if (total % 50 === 0) process.stdout.write(`\r  Inserted ${total} days...`);
    } catch (err) {
      console.error(`\n  Error on ${civilDate}:`, err.message);
    }
  }

  console.log(`\nDone! ${total} daily zmanim rows inserted.`);

  const sample = await sql`SELECT * FROM daily_zmanim WHERE civil_date = '2026-04-15'`;
  if (sample.length > 0) console.log('Sample (Apr 15 2026):', sample[0]);
  else console.log('Note: Apr 15 2026 may not be in the CSV range');
}

main().catch(err => { console.error(err); process.exit(1); });
