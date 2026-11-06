// Name of a special Shabbos, shown after the parsha on the TV header and the
// poster title, e.g. "חיי שרה - מברכים". Returns '' for a regular Shabbos.
// Computed from the Hebrew calendar (built into Node's Intl), so nothing to enter.
//
//   שובה      3–9 Tishrei               שירה   parsha Beshalach
//   שקלים     on/before Rosh Chodesh Adar (Adar II in a leap year)
//   זכור      7–13 Adar                 פרה    the Shabbos before החודש
//   החודש     on/before Rosh Chodesh Nisan
//   הגדול     8–14 Nisan                חזון   3–9 Av      נחמו   10–16 Av
//   חנוכה     any of the 8 days from 25 Kislev
//   ראש חודש  the Shabbos is the 30th or the 1st (not Rosh Hashanah)
//   מברכים    Rosh Chodesh falls in the coming week, except Tishrei. Dropped on
//             Shekalim / HaChodesh (already the mevorchim Shabbos) and when the
//             Shabbos is itself Rosh Chodesh.
// More than one can apply; they're joined with ", " (e.g. "חנוכה, מברכים").
var HEB = new Intl.DateTimeFormat('en-u-ca-hebrew', { timeZone: 'UTC', day: 'numeric', month: 'long' });

function heb(shabbosStr, plusDays) {
    var d = new Date(new Date(shabbosStr + 'T12:00:00Z').getTime() + plusDays * 86400000);
    var o = { day: 0, month: '' };
    HEB.formatToParts(d).forEach(function (p) {
        if (p.type === 'day') o.day = parseInt(p.value, 10);
        if (p.type === 'month') o.month = p.value;
    });
    return o;
}

function isAdar(m) { return m === 'Adar' || m === 'Adar II'; }

function namedShabbos(shabbosStr, parsha) {
    var h = heb(shabbosStr, 0), m = h.month, d = h.day, i, n;
    if (m === 'Tishri' && d >= 3 && d <= 9) return 'שובה';
    if (/בשלח|beshalach/i.test(parsha || '')) return 'שירה';
    for (i = 0; i <= 6; i++) {
        n = heb(shabbosStr, i);
        if (n.day === 1 && isAdar(n.month)) return 'שקלים';
        if (n.day === 1 && n.month === 'Nisan') return 'החודש';
    }
    if (isAdar(m) && d >= 7 && d <= 13) return 'זכור';
    for (i = 7; i <= 13; i++) {
        n = heb(shabbosStr, i);
        if (n.day === 1 && n.month === 'Nisan') return 'פרה';
    }
    if (m === 'Nisan' && d >= 8 && d <= 14) return 'הגדול';
    if (m === 'Av' && d >= 3 && d <= 9) return 'חזון';
    if (m === 'Av' && d >= 10 && d <= 16) return 'נחמו';
    return '';
}

function shabbosSpecial(shabbosStr, parsha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(shabbosStr || ''))) return '';
    var h = heb(shabbosStr, 0), i, n, names = [];
    var named = namedShabbos(shabbosStr, parsha);
    if (named) names.push(named);

    // Chanukah: 25 Kislev was today or within the last 7 days.
    for (i = 0; i <= 7; i++) {
        n = heb(shabbosStr, -i);
        if (n.day === 25 && n.month === 'Kislev') { names.push('חנוכה'); break; }
    }

    var isRoshChodesh = h.day === 30 || (h.day === 1 && h.month !== 'Tishri');
    if (isRoshChodesh) names.push('ראש חודש');

    if (!isRoshChodesh && named !== 'שקלים' && named !== 'החודש') {
        for (i = 1; i <= 7; i++) {
            n = heb(shabbosStr, i);
            if (n.day === 30 || (n.day === 1 && n.month !== 'Tishri')) { names.push('מברכים'); break; }
        }
    }
    return names.join(', ');
}

module.exports = { shabbosSpecial: shabbosSpecial };
