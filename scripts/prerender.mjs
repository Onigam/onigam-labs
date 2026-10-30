// After `vite build` (client) and `vite build --ssr` (this repo's entry-server), writes the real pages:
// dist/index.html (French), dist/en/index.html (English), plus sitemap.xml and robots.txt.
// The pages are complete HTML (no flash, no JavaScript needed to read them); main.ts only adds behaviour.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(ROOT, 'dist');
const ssrDir = path.join(ROOT, '.ssr');

// The public address. A fork sets SITE_URL to its own domain.
const SITE_URL = (process.env.SITE_URL ?? 'https://labs.onigam.io').replace(/\/$/, '');

const entryFile = fs.readdirSync(ssrDir).find((f) => /^entry-server\.m?js$/.test(f));
if (!entryFile)
  throw new Error('.ssr/entry-server.js is missing: run `vite build --ssr src/entry-server.ts --outDir .ssr`');
const ssr = await import(pathToFileURL(path.join(ssrDir, entryFile)).href);
const { render, DICTS, PATHS, LABS } = ssr;

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const year = new Date().getFullYear();

// the two fonts above the fold are preloaded (their hashed names come from the build)
const assets = fs.readdirSync(path.join(dist, 'assets'));
const preload = assets
  .filter((f) => /^(space-grotesk|jetbrains-mono)-latin-wght-normal/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ');

const THEME_SCRIPT = `document.documentElement.classList.add('js');try{var t=localStorage.getItem('onigam-labs:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
// Only the root page picks a language: an English browser (or an earlier choice of English) goes to /en/.
const ROOT_SCRIPT = `try{var s=localStorage.getItem('onigam-labs:lang');var l=s||((navigator.languages&&navigator.languages[0])||navigator.language||'fr').slice(0,2).toLowerCase();if(l==='en'&&!/[?&]lang=fr/.test(location.search))location.replace('/en/'+location.search+location.hash)}catch(e){}`;
const sha = (s) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;

function head(lang) {
  const t = DICTS[lang];
  const url = SITE_URL + PATHS[lang];
  const other = lang === 'fr' ? 'en' : 'fr';
  const live = LABS.filter((l) => l.status === 'live');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t.meta.title,
    description: t.meta.description,
    inLanguage: lang,
    url,
    author: { '@type': 'Person', name: 'Magino', url: 'https://github.com/Onigam' },
    hasPart: live.map((l) => ({
      '@type': 'WebApplication',
      name: l.title[lang],
      description: l.tagline[lang],
      url: l.liveUrl,
      applicationCategory: 'EducationalApplication',
      inLanguage: l.languages,
    })),
  };
  const scripts = [THEME_SCRIPT, ...(lang === 'fr' ? [ROOT_SCRIPT] : [])];
  const csp = [
    `default-src 'self'`,
    `script-src 'self' ${scripts.map(sha).join(' ')}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'none'`,
  ].join('; ');
  return `<meta http-equiv="Content-Security-Policy" content="${esc(csp)}">
    <title>${esc(t.meta.title)}</title>
    <meta name="description" content="${esc(t.meta.description)}">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="#eef1ec" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#0d1a24" media="(prefers-color-scheme: dark)">
    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="fr" href="${SITE_URL}${PATHS.fr}">
    <link rel="alternate" hreflang="en" href="${SITE_URL}${PATHS.en}">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}${PATHS.fr}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Onigam Labs">
    <meta property="og:title" content="${esc(t.meta.title)}">
    <meta property="og:description" content="${esc(t.meta.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:locale" content="${lang === 'fr' ? 'fr_FR' : 'en_GB'}">
    <meta property="og:locale:alternate" content="${other === 'fr' ? 'fr_FR' : 'en_GB'}">
    <meta property="og:image" content="${SITE_URL}/og-${lang}.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    ${preload}
    <script>${THEME_SCRIPT}</script>${lang === 'fr' ? `\n    <script>${ROOT_SCRIPT}</script>` : ''}
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

/** Length of the spoken tour, if its audio exists (scripts/check-narration.mjs has already vouched for it). */
function tourSeconds(lang) {
  const file = path.join(dist, 'audio', lang, 'manifest.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).totalSeconds : undefined;
}

function page(lang) {
  const html = template
    .replace('<html lang="fr">', `<html lang="${lang}">`)
    .replace('<!--head-->', head(lang))
    .replace(
      '<div id="app"><!--app--></div>',
      `<div id="app" data-prerendered>${render(lang, year, tourSeconds(lang))}</div>`,
    );
  if (html === template) throw new Error('the template placeholders were not found in dist/index.html');
  return html;
}

fs.mkdirSync(path.join(dist, 'en'), { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), page('fr'));
fs.writeFileSync(path.join(dist, 'en/index.html'), page('en'));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['fr', 'en']
  .map(
    (l) => `  <url>
    <loc>${SITE_URL}${PATHS[l]}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}${PATHS.fr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${PATHS.en}"/>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`prerendered fr + en for ${SITE_URL}`);
