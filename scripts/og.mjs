// Takes the share images (public/og-fr.png and public/og-en.png, 1200×630) from the built site: the hero, mid-way
// through its scroll, so the runner is shown coming apart. Run `npm run build` first.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { CHROME } from './lib/capture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('dist/ is missing: run `npm run build` first');

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.json': 'application/json',
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dist, p);
  if (!file.startsWith(dist) || !fs.existsSync(file)) return void res.writeHead(404).end();
  res
    .writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    .end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
try {
  for (const [lang, url] of [
    ['fr', `${base}/?lang=fr`],
    ['en', `${base}/en/`],
  ]) {
    const page = await browser.newPage();
    // laid out at 1440×756 (the hero's wide layout), rendered at 1200×630
    await page.setViewport({ width: 1440, height: 756, deviceScaleFactor: 1200 / 1440 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1800));
    // scroll to the middle of the "take apart" step
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      const hero = document.querySelector('[data-story]');
      const pin = hero.querySelector('.hero__pin');
      window.scrollTo(0, (hero.offsetHeight - pin.offsetHeight) * 0.5);
    });
    await new Promise((r) => setTimeout(r, 1500));
    const out = path.join(ROOT, `public/og-${lang}.png`);
    await page.screenshot({ path: out });
    console.log('wrote', path.relative(ROOT, out));
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
