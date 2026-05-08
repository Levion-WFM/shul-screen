const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const TEMPLATE_PATH = path.join(__dirname, '..', 'weekly-schedule', 'template.pdf');
const FONT_PATH = path.join(__dirname, '..', 'weekly-schedule', 'fonts', 'FrankRuhlLibre.ttf');
const INK = rgb(0.10, 0.15, 0.31);

function clockText(s) {
    if (!s) return null;
    const m = /^(\d{1,2}:\d{2})/.exec(String(s).trim());
    return m ? m[1] : String(s).trim();
}

function reverseForPdfRtl(s) {
    const mirror = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{' };
    return Array.from(String(s || '')).reverse().map(ch => mirror[ch] || ch).join('');
}

function textWidth(font, text, size) {
    return font.widthOfTextAtSize(String(text || ''), size);
}

function drawRtl(page, font, text, xRight, y, size, options = {}) {
    const visual = reverseForPdfRtl(text);
    const width = textWidth(font, visual, size);
    page.drawText(visual, {
        x: xRight - width,
        y,
        size,
        font,
        color: options.color || INK,
    });
    return width;
}

function drawCenteredRtl(page, font, text, centerX, y, size, maxWidth, options = {}) {
    let finalSize = size;
    let visual = reverseForPdfRtl(text);
    while (maxWidth && finalSize > 10 && textWidth(font, visual, finalSize) > maxWidth) {
        finalSize -= 1;
    }
    page.drawText(visual, {
        x: centerX - textWidth(font, visual, finalSize) / 2,
        y,
        size: finalSize,
        font,
        color: options.color || INK,
    });
    return finalSize;
}

function drawDots(page, x1, x2, y) {
    if (x2 <= x1) return;
    for (let x = x1; x <= x2; x += 5.2) {
        page.drawCircle({ x, y, size: 0.75, color: INK, opacity: 0.82 });
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
    page.drawText(time, {
        x: metrics.rowLeft,
        y,
        size: metrics.rowSize,
        font,
        color: INK,
    });

    const labelVisual = reverseForPdfRtl(row.label);
    const labelWidth = textWidth(font, labelVisual, metrics.rowSize);
    const labelLeft = metrics.rowRight - labelWidth;
    drawDots(page, metrics.rowLeft + timeWidth + 8, labelLeft - 8, y + metrics.rowSize * 0.22);
    page.drawText(labelVisual, {
        x: labelLeft,
        y,
        size: metrics.rowSize,
        font,
        color: INK,
    });
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

    const parshaName = z.parashaDb || z.parashaHebrew || '';
    drawRtl(page, font, 'בס״ד', width * 0.91, height * 0.765, 12);
    drawCenteredRtl(page, font, 'זמנים לשבת קודש', width / 2, height * 0.705, 15, width * 0.75);
    drawCenteredRtl(page, font, parshaName ? ('פרשת ' + parshaName) : '', width / 2, height * 0.655, 34, width * 0.78);

    const { fridayRows, shabbosRows, kidsRows } = buildRows(z);
    const totalRows = fridayRows.length + shabbosRows.length + kidsRows.length;
    const dense = totalRows >= 12;
    const metrics = {
        rowSize: dense ? 25 : 29,
        lineHeight: dense ? 30 : 35,
        rowLeft: width * 0.205,
        rowRight: width * 0.795,
    };

    const groups = [fridayRows, shabbosRows];
    if (kidsRows.length) groups.push(kidsRows);
    const topY = height * 0.605;
    const bottomY = height * 0.175;
    const groupHeights = groups.map(rows => rows.length * metrics.lineHeight);
    const used = groupHeights.reduce((a, b) => a + b, 0);
    const between = groups.length > 1 ? Math.max(14, (topY - bottomY - used) / (groups.length - 1)) : 0;

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
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="bmj21-schedule-${data.date || new Date().toISOString().slice(0, 10)}.pdf"`);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('weekly-schedule-pdf error:', err);
        return res.status(500).json({ error: String((err && err.message) || err) });
    }
};

module.exports._renderSchedulePdf = renderSchedulePdf;
