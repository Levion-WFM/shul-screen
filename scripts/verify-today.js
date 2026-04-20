const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const [row] = await sql`SELECT * FROM daily_zmanim WHERE civil_date = '2026-04-19'`;
  console.log('Today (2026-04-19):');
  console.log(JSON.stringify(row, null, 2));
  const holidays = await sql`
    SELECT civil_date, holiday_hebrew, holiday_english
    FROM daily_zmanim
    WHERE holiday_hebrew IS NOT NULL AND civil_date >= '2026-04-19'
    ORDER BY civil_date LIMIT 10
  `;
  console.log('\nUpcoming holidays:');
  holidays.forEach(h => console.log(' ', h.civil_date.toISOString().slice(0,10), h.holiday_hebrew, '|', h.holiday_english));
})();
