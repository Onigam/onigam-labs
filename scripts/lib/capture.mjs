// Takes the thumbnails of a lab with headless Chrome (puppeteer-core, the Chrome already installed on the machine).
// A thumbnail shows the key device of the lab, centred, without the interface around it: the 3D canvas only, cropped
// to 4:3, in the chosen world, optionally exploded or in section. One shot per language, written as WebP at two widths.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

export const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const VIEWPORT = { width: 1600, height: 1000 };
export const THUMB_WIDTHS = [560, 1120];
const RATIO = 4 / 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Interface drawn over or around the 3D view: hidden so the device is the whole picture.
const HIDE =
  '.label-layer, .toolbar, .hint, .narr, .narr__bar, .narr__invite, .strip, .toast { display: none !important; }';

/**
 * `zoom` (>= 1) tightens the crop around `focus` ([x, y] as fractions of the canvas, centre by default).
 * @typedef {{ scene?: string, explode?: number, cutaway?: boolean, zoom?: number, focus?: [number, number] }} Shot
 * @param {{ url: string, slug: string, outDir: string, langs?: string[], shot?: Shot, maxSettleMs?: number }} opts
 * @returns {Promise<string[]>} the files written
 */
export async function captureLab({ url, slug, outDir, langs = ['fr', 'en'], shot = {}, maxSettleMs = 45000 }) {
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME} (set CHROME=/path/to/chrome)`);
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
  });
  try {
    for (const lang of langs) {
      const page = await browser.newPage();
      const problems = [];
      page.on('pageerror', (e) => problems.push(String(e)));
      // Labs remember their language and a "first visit" invitation per id (`<id>:lang`, `<id>:narration-invited`).
      await page.evaluateOnNewDocument(
        (id, lang) => {
          Object.defineProperty(navigator, 'language', { get: () => lang });
          Object.defineProperty(navigator, 'languages', { get: () => [lang] });
          localStorage.setItem(`${id}:lang`, lang);
          localStorage.setItem(`${id}:narration-invited`, '1');
        },
        slug,
        lang,
      );
      // the tighter the crop, the more pixels it takes to keep it sharp
      await page.setViewport({ ...VIEWPORT, deviceScaleFactor: Math.min(2, Math.max(1.25, 1.25 * (shot.zoom ?? 1))) });
      await page.goto(shot.scene ? `${url.replace(/#.*$/, '')}#${shot.scene}` : url, {
        waitUntil: 'load',
        timeout: 60000,
      });
      await page.waitForSelector('canvas', { timeout: 90000 });
      await page.addStyleTag({ content: HIDE });
      await hideCanvasButtons(page);
      await settle(browser, page, maxSettleMs, shot);

      if (shot.explode) {
        await page.evaluate((value) => {
          const input = document.querySelector('.tool--range input[type=range]');
          if (!input) throw new Error('no explode slider in this lab');
          input.value = String(value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }, shot.explode);
      }
      if (shot.cutaway) {
        // the toolbar is hidden, not removed: click its section button (the label is "Coupe" or "Section")
        const done = await page.evaluate(() => {
          const b = [...document.querySelectorAll('.toolbar button.tool')].find((x) =>
            /^(coupe|section|cutaway)\b/i.test((x.textContent ?? '').trim()),
          );
          if (b && !b.classList.contains('is-on')) b.click();
          return Boolean(b);
        });
        if (!done) throw new Error('no section button in this lab');
      }
      const png = await settle(browser, page, maxSettleMs, shot);

      for (const width of THUMB_WIDTHS) {
        const file = path.join(outDir, `${slug}-${lang}-${width}.webp`);
        fs.writeFileSync(file, await toWebp(browser, png, width));
        written.push(file);
      }
      await page.close();
      if (problems.length) console.warn(`  ${slug} (${lang}) logged page errors:`, problems.slice(0, 2));
    }
  } finally {
    await browser.close();
  }
  return written;
}

/** Panel handles and other small buttons floating over the 3D view. */
async function hideCanvasButtons(page) {
  await page.evaluate(() => {
    const r = document.querySelector('canvas').getBoundingClientRect();
    for (const b of document.querySelectorAll('button')) {
      const q = b.getBoundingClientRect();
      if (q.width && q.left >= r.left - 1 && q.right <= r.right + 1 && q.top >= r.top - 1 && q.bottom <= r.bottom + 1)
        b.style.visibility = 'hidden';
    }
  });
}

/** The 3D canvas, cropped to 4:3, tightened by `zoom` around `focus`. */
async function shootCanvas(page, { zoom = 1, focus = [0.5, 0.5] } = {}) {
  const r = await page.evaluate(() => {
    const q = document.querySelector('canvas').getBoundingClientRect();
    return { x: q.x, y: q.y, width: q.width, height: q.height };
  });
  let width = Math.min(r.width, r.height * RATIO);
  let height = width / RATIO;
  width /= zoom;
  height /= zoom;
  const x = Math.min(Math.max(r.x + r.width * focus[0] - width / 2, r.x), r.x + r.width - width);
  const y = Math.min(Math.max(r.y + r.height * focus[1] - height / 2, r.y), r.y + r.height - height);
  return page.screenshot({ type: 'png', clip: { x, y, width, height } });
}

/**
 * Software WebGL is slow and the first frames are incomplete: take a shot every 2.5 s until two in a row look the
 * same (the water may still flow, so "the same" tolerates a little change), or give up at `maxMs`.
 */
async function settle(browser, page, maxMs, shot) {
  const start = Date.now();
  await sleep(3000);
  let previous = null;
  let calm = 0;
  for (;;) {
    const png = await shootCanvas(page, shot);
    if (previous) {
      calm = (await meanDiff(browser, previous, png)) < 0.8 ? calm + 1 : 0;
      if (calm >= 2) return png;
    }
    previous = png;
    if (Date.now() - start > maxMs) return png;
    await sleep(2500);
  }
}

/** Mean absolute difference (0..255) between two PNGs, compared at 160 px wide. */
async function meanDiff(browser, a, b) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(
      async (da, db) => {
        const load = async (data) => {
          const img = new Image();
          img.src = `data:image/png;base64,${data}`;
          await img.decode();
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 160, 120);
          return ctx.getImageData(0, 0, 160, 120).data;
        };
        const [x, y] = [await load(da), await load(db)];
        let sum = 0;
        for (let i = 0; i < x.length; i++) if (i % 4 !== 3) sum += Math.abs(x[i] - y[i]);
        return sum / ((x.length / 4) * 3);
      },
      Buffer.from(a).toString('base64'),
      Buffer.from(b).toString('base64'),
    );
  } finally {
    await page.close();
  }
}

/** Resizes a PNG to `width` and encodes it as WebP, using a canvas in the browser we already have. */
async function toWebp(browser, png, width) {
  const page = await browser.newPage();
  try {
    const b64 = await page.evaluate(
      async (data, width) => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = Math.round((img.height * width) / img.width);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/webp', 0.85).split(',')[1];
      },
      Buffer.from(png).toString('base64'),
      width,
    );
    return Buffer.from(b64, 'base64');
  } finally {
    await page.close();
  }
}
