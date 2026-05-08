# Weekly Schedule PDF

Canonical weekly Shabbos flier for Beis Medrash D'Jackson 21.

## URLs

- Live display: `https://shul-screen2.vercel.app/weekly-schedule/`
- PDF endpoint: `https://shul-screen2.vercel.app/api/weekly-schedule-pdf`
- Data API: `https://shul-screen2.vercel.app/api/weekly-schedule`

The shul website should embed or link `/weekly-schedule/`. That route displays
the generated PDF directly, so there is no separate PNG/JPEG poster path.

## Data Flow

- `/api/weekly-schedule` reads the current week's zmanim from the kiosk DB.
- `/api/weekly-schedule-pdf` loads `template.pdf`, writes the current week's
  parsha and zmanim onto it, and returns a downloadable PDF.
- `index.html` is only a lightweight shell that displays that PDF and provides
  download/copy controls.

## Files

- `template.pdf` - corrected PDF template/background.
- `fonts/FrankRuhlLibre.ttf` - embedded Hebrew-capable font for generated PDFs.
- `index.html` - PDF display shell used by the shul website.
- `../api/weekly-schedule-pdf.js` - PDF writer.

