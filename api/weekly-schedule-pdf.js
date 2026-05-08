const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const TEMPLATE_PATH = path.join(__dirname, '..', 'weekly-schedule', 'template.pdf');
const BODY_FONT_PATH = path.join(__dirname, '..', 'weekly-schedule', 'fonts', 'FrankRuhlLibre.ttf');
const TIME_FONT_PATH = path.join(__dirname, '..', 'weekly-schedule', 'fonts', 'FrankRuhlLibre.ttf');
const TITLE_FONT_PATH = path.join(__dirname, '..', 'weekly-schedule', 'fonts', 'NotoSerifHebrew.ttf');
const INK = rgb(0.08, 0.13, 0.29);
const PARSHA_PREFIX = '\u05e4\u05e8\u05e9\u05ea';

function clockText(s) {
    if (!s) return null;
    const m = /^(\d{1,2}:\d{2})/.exec(String(s).trim());
    return m ? m[1] : String(s).trim();
}

function normalizeHebrewWording(s) {
    return String(s || '')
        .replace(/בחוקתי/g, 'בחוקותי')
        .replace(/בחקתי/g, 'בחוקותי');
}

function formatParshaTitle(parshaName) {
    const clean = normalizeHebrewWording(parshaName).trim().replace(/^פרשת\s+/, '');
    return clean ? `${PARSHA_PREFIX} ${clean}` : '\u05e9\u05d1\u05ea \u05e7\u05d5\u05d3\u05e9';
}

function visualRtl(s) {
    return String(s || '');
}

function textWidth(font, text, size) {
    return font.widthOfTextAtSize(String(text || ''), size);
}

function drawTextLayer(page, text, x, y, size, font, options = {}) {
    const color = options.color || INK;
    page.drawText(text, {
        x,
        y,
        size,
        font,
        color,
    });
}

function drawRtl(page, font, text, xRight, y, size, options = {}) {
    const visual = visualRtl(text);
    const width = textWidth(font, visual, size);
    drawTextLayer(page, visual, xRight - width, y, size, font, options);
    return width;
}

function drawCenteredRtl(page, font, text, centerX, y, size, maxWidth, options = {}) {
    let finalSize = size;
    let visual = visualRtl(text);
    while (maxWidth && finalSize > 10 && textWidth(font, visual, finalSize) > maxWidth) {
        finalSize -= 1;
    }
    drawTextLayer(page, visual, centerX - textWidth(font, visual, finalSize) / 2, y, finalSize, font, options);
    return finalSize;
}

function drawHeadline(page, font, parshaName, width, height) {
    drawCenteredRtl(page, font, formatParshaTitle(parshaName), width / 2, height * 0.679, 40, width * 0.68);
}

function drawDots(page, x1, x2, y) {
    if (x2 <= x1) return;
    for (let x = x1; x <= x2; x += 4.2) {
        page.drawCircle({ x, y, size: 0.52, color: INK, opacity: 0.62 });
    }
}

function buildRows(z) {
    const minchaA = z.minchaErevShabbosA || null;
    const minchaB = z.minchaErevShabbos || null;
    const fridayRows = [
        { label: 'הדלקת נרות', time: z.candles },
        minchaA ? { label: 'מנחה א׳', time: minchaA } : null,
        { label: 'פלג המנחה', time: z.plag },
        minchaA
            ? { label: 'מנחה ב׳', time: minchaB || '—' }
            : { label: 'מנחה', time: minchaB || '—' },
        { label: 'שקיעה', time: z.shkiaFriday || z.shkia },
    ].filter(Boolean);

    const shiurMap = {};
    (Array.isArray(z.shiurim) ? z.shiurim : []).forEach(s => { shiurMap[s.label] = s.time; });
    const krishemaTime = z.sofZmanKriasShema
        || ((z.shemaMa && z.shemaGra) ? (z.shemaMa + ' / ' + z.shemaGra) : (z.shemaGra || z.shemaMa || null));
    const shabbosRows = [
        { label: 'שחרית', time: z.shacharis },
        krishemaTime ? { label: 'סוף זמן ק״ש', time: krishemaTime } : null,
        shiurMap['שיעור הלכה'] ? { label: 'שיעור הלכה', time: shiurMap['שיעור הלכה'] } : null,
        { label: 'מנחה', time: z.minchaShabbos },
        { label: 'שקיעה', time: z.shkia },
        shiurMap['פרקי אבות'] ? { label: 'פרקי אבות', time: shiurMap['פרקי אבות'] } : null,
        { label: 'מעריב', time: z.maariv },
    ].filter(Boolean);

    const kidsRows = [];
    if (z.pircheiTime) kidsRows.push({ label: 'פרחי', time: z.pircheiTime });
    if (z.avosUbanimTime) kidsRows.push({ label: 'אבות ובנים', time: z.avosUbanimTime });

    return { fridayRows, shabbosRows, kidsRows };
}

function drawRow(page, fonts, row, y, metrics) {
    const time = clockText(row.time) || '—';
    const timeWidth = textWidth(fonts.time, time, metrics.rowSize);
    drawTextLayer(page, time, metrics.rowLeft, y, metrics.rowSize, fonts.time);

    const labelVisual = visualRtl(row.label);
    const labelWidth = textWidth(fonts.body, labelVisual, metrics.rowSize);
    const labelLeft = metrics.rowRight - labelWidth;
    drawDots(page, metrics.rowLeft + timeWidth + 8, labelLeft - 10, y + metrics.rowSize * 0.22);
    drawTextLayer(page, labelVisual, labelLeft, y, metrics.rowSize, fonts.body);
}

async function renderSchedulePdf(payload) {
    const z = payload.zmanim || {};
    const templateBytes = fs.readFileSync(TEMPLATE_PATH);
    const bodyFontBytes = fs.readFileSync(BODY_FONT_PATH);
    const timeFontBytes = fs.readFileSync(TIME_FONT_PATH);
    const titleFontBytes = fs.readFileSync(TITLE_FONT_PATH);
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const bodyFont = await pdfDoc.embedFont(bodyFontBytes, { subset: true });
    const timeFont = await pdfDoc.embedFont(timeFontBytes, { subset: true });
    const titleFont = await pdfDoc.embedFont(titleFontBytes, { subset: true });
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    const parshaName = normalizeHebrewWording(z.parashaDb || z.parashaHebrew || '');
    drawHeadline(page, titleFont, parshaName, width, height);

    const { fridayRows, shabbosRows, kidsRows } = buildRows(z);
    const totalRows = fridayRows.length + shabbosRows.length + kidsRows.length;
    const dense = totalRows >= 12;
    const metrics = {
        rowSize: dense ? 25.5 : 27,
        lineHeight: dense ? 29.8 : 32.5,
        rowLeft: width * 0.258,
        rowRight: width * 0.727,
    };

    const groups = [fridayRows, shabbosRows];
    if (kidsRows.length) groups.push(kidsRows);
    const topY = height * 0.603;
    const bottomY = height * 0.185;
    const groupHeights = groups.map(rows => rows.length * metrics.lineHeight);
    const used = groupHeights.reduce((a, b) => a + b, 0);
    const between = groups.length > 1 ? Math.max(19, (topY - bottomY - used) / (groups.length - 1)) : 0;

    let y = topY;
    const fonts = { body: bodyFont, time: timeFont };
    groups.forEach((rows, groupIndex) => {
        rows.forEach(row => {
            drawRow(page, fonts, row, y, metrics);
            y -= metrics.lineHeight;
        });
        if (groupIndex < groups.length - 1) y -= between;
    });

    const note = (z.scheduleNote || '').trim();
    if (note) {
        drawCenteredRtl(page, bodyFont, note, width / 2, height * 0.13, 15, width * 0.7, {
            color: rgb(0.28, 0.32, 0.43),
        });
    }

    return pdfDoc.save();
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        if (!host) throw new Error('Missing host header');
        const dataRes = await fetch(`${proto}://${host}/api/weekly-schedule`, { cache: 'no-store' });
        const data = await dataRes.json();
        if (!dataRes.ok || !data.ok) throw new Error(data.error || 'Could not load weekly schedule');

        const pdfBytes = await renderSchedulePdf(data);
        const disposition = req.query && req.query.inline ? 'inline' : 'attachment';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="bmj21-schedule-${data.date || new Date().toISOString().slice(0, 10)}.pdf"`);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('weekly-schedule-pdf error:', err);
        return res.status(500).json({ error: String((err && err.message) || err) });
    }
};

module.exports._renderSchedulePdf = renderSchedulePdf;
