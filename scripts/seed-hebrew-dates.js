/**
 * Generate Hebrew dates for 3 years using Hebcal API
 * and insert into Neon database.
 *
 * Run: node scripts/seed-hebrew-dates.js
 * Requires DATABASE_URL env var.
 */

const { neon } = require('@neondatabase/serverless');

async function getHebrewDate(year, month, day) {
  const url = `https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    full: data.hebrew,
    day: data.heDateParts?.d,
    month: data.heDateParts?.m,
    year: data.heDateParts?.y,
  };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.error('Set DATABASE_URL'); process.exit(1); }

  const sql = neon(dbUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS hebrew_dates (
      gregorian_date DATE PRIMARY KEY,
      hebrew_date TEXT NOT NULL,
      hebrew_day TEXT,
      hebrew_month TEXT,
      hebrew_year TEXT
    )
  `;

  let total = 0;

  // April 2026 through April 2029
  const startYear = 2026, startMonth = 4;
  const endYear = 2029, endMonth = 4;

  for (let y = startYear; y <= endYear; y++) {
    const mStart = (y === startYear) ? startMonth : 1;
    const mEnd = (y === endYear) ? endMonth : 12;

    for (let m = mStart; m <= mEnd; m++) {
      const days = daysInMonth(y, m);
      console.log(`Processing ${y}-${String(m).padStart(2,'0')} (${days} days)...`);

      for (let d = 1; d <= days; d++) {
        try {
          const heb = await getHebrewDate(y, m, d);
          const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

          await sql`
            INSERT INTO hebrew_dates (gregorian_date, hebrew_date, hebrew_day, hebrew_month, hebrew_year)
            VALUES (${dateStr}::date, ${heb.full}, ${heb.day}, ${heb.month}, ${heb.year})
            ON CONFLICT (gregorian_date) DO UPDATE SET
              hebrew_date = EXCLUDED.hebrew_date,
              hebrew_day = EXCLUDED.hebrew_day,
              hebrew_month = EXCLUDED.hebrew_month,
              hebrew_year = EXCLUDED.hebrew_year
          `;
          total++;
        } catch (err) {
          console.error(`  Error on ${y}-${m}-${d}:`, err.message);
          // Brief pause on error then continue
          await new Promise(r => setTimeout(r, 500));
        }

        // Small delay to not hammer the API
        if (d % 10 === 0) await new Promise(r => setTimeout(r, 200));
      }

      console.log(`  Done. Total so far: ${total}`);
    }
  }

  console.log(`\nComplete! ${total} Hebrew dates inserted.`);

  const sample = await sql`SELECT * FROM hebrew_dates WHERE gregorian_date = '2026-04-15'`;
  console.log('Sample:', sample[0]);
}

main().catch(err => { console.error(err); process.exit(1); });
