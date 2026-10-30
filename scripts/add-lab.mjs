// Adds a lab to the showcase, or refreshes it: reads the lab's public/lab.json, checks which spoken guides it ships,
// frames and captures its thumbnails, and writes src/data/labs/<slug>.json. Run it again whenever the lab changes.
//
//   npm run add-lab <slug> [options]          see `npm run add-lab -- --help`
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { LANGS, validateLab } from '../src/data/schema.ts';
import { captureLab } from './lib/capture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LABS_DIR = path.join(ROOT, 'src/data/labs');
const OUT_DIR = path.join(ROOT, 'public/labs');
const PLACEHOLDER = /^(a lab to replace|un lab à remplacer)$/i;
// lab.json tags that name a domain of the showcase; any other tag stays a free tag (wind, off-grid…)
const TAG_DOMAIN = {
  electricity: ['electricity'],
  wind: ['electricity'],
  water: ['water'],
  hydraulics: ['water'],
  hydro: ['water', 'electricity'],
  heat: ['heat'],
  thermal: ['heat'],
  storage: ['storage'],
  battery: ['storage'],
};
const DOMAIN_WORDS = new Set(['electricity', 'water', 'heat', 'storage']);

const HELP = `Usage: npm run add-lab <slug> [options]

  --status live|building|planned   default live (building and planned never overwrite hand-written text)
  --from <folder|url>              where to read public/lab.json (default ../<slug>, else https://<slug>.onigam.io)
  --url <url>                      live address (default https://<slug>.onigam.io)
  --repo <url>                     GitHub address (default: the origin of the local folder, else github.com/Onigam/<slug>)
  --domains a,b                    force the domains (electricity, heat, water, storage)
  --order <n>                      position inside its status group (default: after the others)
  Thumbnail framing, saved in the entry so a refresh frames it the same way:
  --scene <id>  --explode <0..1>  --cutaway  --zoom <n>  --focus <x,y>
  --no-capture                     keep the thumbnails you have
  --capture-only                   only take the thumbnails again
  --all                            refresh every lab of the site from its lab.json (no thumbnails unless --capture-only)
`;

const { values: v, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    status: { type: 'string' },
    from: { type: 'string' },
    url: { type: 'string' },
    repo: { type: 'string' },
    domains: { type: 'string' },
    order: { type: 'string' },
    scene: { type: 'string' },
    explode: { type: 'string' },
    cutaway: { type: 'boolean' },
    zoom: { type: 'string' },
    focus: { type: 'string' },
    'no-capture': { type: 'boolean' },
    'capture-only': { type: 'boolean' },
    all: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const entryPath = (slug) => path.join(LABS_DIR, `${slug}.json`);

async function fetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** lab.json of the lab: from its folder or from its live site. */
async function readLabJson(slug, liveUrl) {
  const candidates = [];
  if (v.from && !/^https?:/.test(v.from)) candidates.push(path.resolve(v.from, 'public/lab.json'));
  else if (!v.from) candidates.push(path.resolve(ROOT, '..', slug, 'public/lab.json'));
  for (const file of candidates) if (fs.existsSync(file)) return { json: readJson(file), where: file };
  const base = v.from && /^https?:/.test(v.from) ? v.from : liveUrl;
  const json = await fetchJson(`${base.replace(/\/$/, '')}/lab.json`);
  return json ? { json, where: `${base}/lab.json` } : null;
}

/** Which spoken guides the live lab ships (its audio manifest answers). */
async function spokenGuides(liveUrl) {
  const found = [];
  for (const lang of LANGS) {
    const json = await fetchJson(`${liveUrl.replace(/\/$/, '')}/audio/${lang}/manifest.json`);
    if (json) found.push(lang);
  }
  return found;
}

function repoFromFolder(slug) {
  const dir = path.resolve(ROOT, '..', slug);
  if (!fs.existsSync(path.join(dir, '.git'))) return null;
  try {
    const origin = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    const m = origin.match(/github\.com[:/](.+?)(\.git)?$/);
    return m ? `https://github.com/${m[1]}` : null;
  } catch {
    return null;
  }
}

function splitTags(tags = []) {
  const domains = new Set();
  const free = [];
  for (const raw of tags) {
    const tag = String(raw).toLowerCase();
    (TAG_DOMAIN[tag] ?? []).forEach((d) => domains.add(d));
    if (!DOMAIN_WORDS.has(tag)) free.push(tag);
  }
  return { domains: [...domains], free };
}

const KEY_ORDER = [
  'slug',
  'order',
  'status',
  'title',
  'tagline',
  'domains',
  'tags',
  'difficulty',
  'minutes',
  'languages',
  'spokenGuide',
  'liveUrl',
  'thumbnail',
  'repoUrl',
  'capture',
  'sources',
];
/** Keys in a stable order, so refreshing an entry never shows up as a diff. */
const canonical = (entry) =>
  Object.fromEntries(Object.entries(entry).sort(([a], [b]) => KEY_ORDER.indexOf(a) - KEY_ORDER.indexOf(b)));

/** Same rule as `pick`, for the lists derived from the tags. */
const pickList = (own, fromLab, status) =>
  status === 'live' ? (fromLab.length ? fromLab : (own ?? [])) : (own ?? fromLab);

async function addLab(slug) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`"${slug}" is not a lab slug (kebab-case, like pelton-lab)`);
  const file = entryPath(slug);
  const existing = fs.existsSync(file) ? readJson(file) : null;
  const status = v.status ?? (existing && existing.status !== 'planned' ? existing.status : 'live');
  if (!['live', 'building', 'planned'].includes(status)) fail(`--status must be live, building or planned`);
  const liveUrl = (v.url ?? existing?.liveUrl ?? `https://${slug}.onigam.io`).replace(/\/$/, '');
  const found = await readLabJson(slug, liveUrl);
  const lab = found?.json ?? null;
  console.log(
    found
      ? `· lab.json read from ${found.where}`
      : `· no lab.json found${existing ? ', keeping the entry as it is' : ''}`,
  );
  if (!lab && !existing)
    fail(
      `No public/lab.json for ${slug} (looked in ../${slug} and at ${liveUrl}/lab.json).\n` +
        `  Add one to the lab (lab-template ships it), or write src/data/labs/${slug}.json by hand (see the README).`,
    );
  const placeholder = lab && PLACEHOLDER.test(lab.tagline?.en ?? '');
  if (placeholder && status === 'live')
    fail(`${slug}'s lab.json is still the template's. Fill it in, or use --status building.`);

  // lab.json fills an entry. Online, it wins; for a lab not online yet it only fills what is missing, never what was
  // written by hand (its lab.json may still be the template's)
  const useLab = lab && !placeholder;
  const pick = (key, fromLab) => {
    const own = existing?.[key];
    return status === 'live'
      ? useLab && fromLab !== undefined
        ? fromLab
        : own
      : (own ?? (useLab ? fromLab : undefined));
  };
  const { domains, free } = splitTags(useLab ? lab.tags : []);

  const entry = {
    slug,
    order:
      v.order !== undefined
        ? Number(v.order)
        : (existing?.order ??
          1 +
            Math.max(
              0,
              ...fs
                .readdirSync(LABS_DIR)
                .map((f) => readJson(path.join(LABS_DIR, f)))
                .filter((e) => e.status === status)
                .map((e) => e.order),
            )),
    status,
    title: pick('title', lab?.title),
    tagline: pick('tagline', lab?.tagline),
    domains: v.domains ? v.domains.split(',') : pickList(existing?.domains, domains, status),
    tags: pickList(existing?.tags, free, status),
    difficulty: pick('difficulty', lab?.difficulty),
    minutes: pick('minutes', lab?.minutes),
    languages: existing?.languages ?? ['fr', 'en'],
    spokenGuide: existing?.spokenGuide ?? [],
  };
  if (status !== 'planned')
    entry.repoUrl = v.repo ?? existing?.repoUrl ?? repoFromFolder(slug) ?? `https://github.com/Onigam/${slug}`;
  else if (v.repo ?? existing?.repoUrl) entry.repoUrl = v.repo ?? existing.repoUrl;
  if (status === 'live') {
    entry.liveUrl = liveUrl;
    entry.spokenGuide = await spokenGuides(liveUrl);
    console.log(`· spoken guides found: ${entry.spokenGuide.join(', ') || 'none'}`);
  }
  if (existing?.thumbnail) entry.thumbnail = existing.thumbnail;
  const capture = { ...(existing?.capture ?? {}) };
  if (v.scene) capture.scene = v.scene;
  if (v.explode !== undefined) capture.explode = Number(v.explode);
  if (v.cutaway) capture.cutaway = true;
  if (v.zoom) capture.zoom = Number(v.zoom);
  if (v.focus) capture.focus = v.focus.split(',').map(Number);
  if (Object.keys(capture).length) entry.capture = capture;
  entry.sources = useLab && Array.isArray(lab.sources) && lab.sources.length ? lab.sources : (existing?.sources ?? []);

  if (status === 'live' && !v['no-capture']) {
    console.log(`· taking the thumbnails of ${liveUrl} (a few minutes: Chrome renders the 3D scene in software)…`);
    await captureLab({ url: liveUrl, slug, outDir: OUT_DIR, shot: capture });
    entry.thumbnail = slug;
  }
  if (!entry.sources.length && status === 'live')
    console.warn(`! no sources yet: add them to src/data/labs/${slug}.json (the site credits them in About)`);

  const clean = canonical(JSON.parse(JSON.stringify(entry)));
  const errors = validateLab(clean, slug);
  fs.writeFileSync(file, JSON.stringify(clean, null, 2) + '\n');
  execFileSync('npx', ['prettier', '--object-wrap', 'collapse', '--write', file], { cwd: ROOT, stdio: 'ignore' });
  if (errors.length) {
    console.error(`\n! ${slug}.json written, but it needs a fix before the build passes:`);
    errors.forEach((e) => console.error(`    - ${e}`));
    return false;
  }
  console.log(`✓ src/data/labs/${slug}.json ${existing ? 'updated' : 'created'} (${status})`);
  return true;
}

async function captureOnly(slug) {
  const file = entryPath(slug);
  if (!fs.existsSync(file)) fail(`No entry for ${slug}: run add-lab without --capture-only first.`);
  const entry = readJson(file);
  if (entry.status !== 'live') fail(`${slug} is not live: there is nothing to capture.`);
  await captureLab({ url: entry.liveUrl, slug, outDir: OUT_DIR, shot: entry.capture ?? {} });
  if (entry.thumbnail !== slug) {
    entry.thumbnail = slug;
    fs.writeFileSync(file, JSON.stringify(entry, null, 2) + '\n');
    execFileSync('npx', ['prettier', '--object-wrap', 'collapse', '--write', file], { cwd: ROOT, stdio: 'ignore' });
  }
  console.log(`✓ thumbnails of ${slug} taken again`);
}

if (v.help || (!positionals.length && !v.all)) {
  console.log(HELP);
  process.exit(v.help ? 0 : 1);
}

let ok = true;
if (v.all) {
  for (const f of fs.readdirSync(LABS_DIR).filter((f) => f.endsWith('.json'))) {
    const slug = f.replace(/\.json$/, '');
    if (v['capture-only']) {
      if (readJson(entryPath(slug)).status === 'live') await captureOnly(slug);
    } else {
      v['no-capture'] = true;
      ok = (await addLab(slug)) && ok;
    }
  }
} else if (v['capture-only']) {
  await captureOnly(positionals[0]);
} else {
  ok = await addLab(positionals[0]);
}
if (ok)
  console.log(
    `\nNext: npm run build   (checks everything), then commit src/data/labs and public/labs, and push: Vercel publishes it.`,
  );
process.exit(ok ? 0 : 1);
