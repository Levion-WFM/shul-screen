// Client-side rasterizer for the weekly Shabbos poster. Fetches the
// pdf-lib output that the iframe preview already uses, renders page 1
// to a 300 DPI canvas via pdfjs (loaded on demand from cdnjs), then
// encodes JPEG and triggers a download.
//
// Done in the browser to keep the Vercel deploy lean — adding pdfjs-dist
// + a server-side canvas (sharp/@napi-rs/canvas) would push deps past
// ~80MB. The trade-off is one ~1MB pdfjs fetch per session, after which
// renders are local and instant.
//
// On any failure we fall back to a direct PDF download so the gabbai
// still gets a file.

(function () {
    const PDFJS_VERSION = '4.6.82';
    const PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION;
    const DPI = 300;
    const SCALE = DPI / 72;
    const JPEG_QUALITY = 0.92;
    const PDF_URL = '/api/weekly-schedule-pdf';

    let pdfjsPromise = null;
    function loadPdfJs() {
        if (pdfjsPromise) return pdfjsPromise;
        pdfjsPromise = import(PDFJS_BASE + '/pdf.min.mjs').then(function (mod) {
            mod.GlobalWorkerOptions.workerSrc = PDFJS_BASE + '/pdf.worker.min.mjs';
            return mod;
        });
        return pdfjsPromise;
    }

    async function renderJpgBlob() {
        const [pdfjsLib, pdfRes] = await Promise.all([
            loadPdfJs(),
            fetch(PDF_URL, { cache: 'no-store' }),
        ]);
        if (!pdfRes.ok) throw new Error('PDF fetch failed: ' + pdfRes.status);
        const buf = await pdfRes.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: SCALE });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        // Paint white behind the parchment so JPEG (no alpha) doesn't show
        // black where the template's edges fall outside the design.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        return await new Promise(function (resolve, reject) {
            canvas.toBlob(function (b) {
                if (b) resolve(b);
                else reject(new Error('canvas.toBlob returned null'));
            }, 'image/jpeg', JPEG_QUALITY);
        });
    }

    function todayIso() {
        return new Date().toISOString().slice(0, 10);
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function fallbackPdfDownload() {
        const a = document.createElement('a');
        a.href = PDF_URL;
        a.download = 'bmj21-schedule-' + todayIso() + '.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    window.downloadWeeklyScheduleJpg = async function (btn) {
        const originalLabel = btn ? btn.innerHTML : null;
        if (btn) {
            btn.disabled = true;
            btn.dataset.busy = '1';
            btn.innerHTML = 'Generating…';
        }
        try {
            const blob = await renderJpgBlob();
            triggerDownload(blob, 'bmj21-schedule-' + todayIso() + '.jpg');
        } catch (err) {
            console.error('JPG download failed:', err);
            alert('Could not generate JPG — downloading PDF instead.');
            fallbackPdfDownload();
        } finally {
            if (btn) {
                btn.disabled = false;
                delete btn.dataset.busy;
                if (originalLabel != null) btn.innerHTML = originalLabel;
            }
        }
    };
})();
