const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const bidiFactory = require('bidi-js');

const TEMPLATE_PATH = path.join(__dirname, '..', 'weekly-schedule', 'template.pdf');
const FONT_PATH = path.join(__dirname, '..', 'weekly-schedule', 'fonts', 'FrankRuhlLibre.ttf');
const INK = rgb(0.08, 0.13, 0.29);
const bidi = bidiFactory();

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

function visualRtl(s) {
    const text = String(s || '');
    if (!text) return '';
    const embedding = bidi.getEmbeddingLevels(text, 'rtl');
    const chars = Array.from(text);
    const mirrored = bidi.getMirroredCharactersMap(text, embedding);
    for (const [index, mirroredChar] of mirrored) chars[index] = mirroredChar;
    const flips = bidi.getReorderSegments(text, embedding);
    flips.forEach(([start, end]) => {
        let left = start;
        let right = end;
        while (left < right) {
            const tmp = chars[left];
            chars[left] = chars[right];
            chars[right] = tmp;
            left += 1;
            right -= 1;
        }
    });
    return chars.join('');
}

function textWidth(font, text, size) {
    return font.widthOfTextAtSize(String(text || ''), size);
}

function drawTextLayer(page, text, x, y, size, font, options = {}) {
    const color = options.color || INK;
    const bold = options.bold || 0;
    const offsets = bold >= 2
        ? [[0, 0], [0.24, 0], [-0.16, 0], [0, 0.16], [0.14, 0.10]]
        : bold >= 1
            ? [[0, 0], [0.20, 0], [0, 0.12]]
            : [[0, 0]];

    offsets.forEach(([dx, dy]) => {
        page.drawText(text, {
            x: x + dx,
            y: y + dy,
            size,
            font,
            color,
        });
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
    const singleLine = parshaName ? `זמנים לשבת קודש פרשת ${parshaName}` : 'זמנים לשבת קודש';
    drawCenteredRtl(page, font, singleLine, width / 2, height * 0.682, 31, width * 0.73, { bold: 2 });
}

function drawDots(page, x1, x2, y) {
    if (x2 <= x1) return;
    for (let x = x1; x <= x2; x += 4.6) {
        page.drawCircle({ x, y, size: 0.82, color: INK, opacity: 0.88 });
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

function drawRow(page, font, row, y, metrics) {
    const time = clockText(row.time) || '—';
    const timeWidth = textWidth(font, time, metrics.rowSize);
    drawTextLayer(page, time, metrics.rowLeft, y, metrics.rowSize, font, { bold: 2 });

    const labelVisual = visualRtl(row.label);
    const labelWidth = textWidth(font, labelVisual, metrics.rowSize);
    const labelLeft = metrics.rowRight - labelWidth;
    drawDots(page, metrics.rowLeft + timeWidth + 8, labelLeft - 10, y + metrics.rowSize * 0.22);
    drawTextLayer(page, labelVisual, labelLeft, y, metrics.rowSize, font, { bold: 2 });
}

async function renderSchedulePdf(payload) {
    const z = payload.zmanim || {};
    const templateBytes = fs.readFileSync(TEMPLATE_PATH);
    const fontBytes = fs.readFileSync(FONT_PATH);
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes, { subset: true });
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    const parshaName = normalizeHebrewWording(z.parashaDb || z.parashaHebrew || '');
    drawHeadline(page, font, parshaName, width, height);

    const { fridayRows, shabbosRows, kidsRows } = buildRows(z);
    const totalRows = fridayRows.length + shabbosRows.length + kidsRows.length;
    const dense = totalRows >= 12;
    const metrics = {
        rowSize: dense ? 24.5 : 27,
        lineHeight: dense ? 29 : 32.5,
        rowLeft: width * 0.252,
        rowRight: width * 0.735,
    };

    const groups = [fridayRows, shabbosRows];
    if (kidsRows.length) groups.push(kidsRows);
    const topY = height * 0.603;
    const bottomY = height * 0.185;
    const groupHeights = groups.map(rows => rows.length * metrics.lineHeight);
    const used = groupHeights.reduce((a, b) => a + b, 0);
    const between = groups.length > 1 ? Math.max(19, (topY - bottomY - used) / (groups.length - 1)) : 0;

    let y = topY;
    groups.forEach((rows, groupIndex) => {
        rows.forEach(row => {
            drawRow(page, font, row, y, metrics);
            y -= metrics.lineHeight;
        });
        if (groupIndex < groups.length - 1) y -= between;
    });

    const note = (z.scheduleNote || '').trim();
    if (note) {
        drawCenteredRtl(page, font, note, width / 2, height * 0.13, 15, width * 0.7, {
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
