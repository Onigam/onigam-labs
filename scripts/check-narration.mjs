// Checks the spoken guided tour at build time. For each language with a script (narration/<lang>.json):
//   - audio present  → the manifest must match the script (same segments, same text length, real voice model), every
//                      audio file must exist, and every cue must point at something that exists on the page;
//   - audio absent   → fine, the tour button is simply not drawn (a note says so).
// French and English go together: one language with audio and not the other is an error (parity).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const slugs = new Set(fs.readdirSync(path.join(ROOT, 'src/data/labs')).map((f) => f.replace(/\.json$/, '')));
const SECTIONS = new Set(['labs', 'planned', 'inside', 'about']);

/** The text that is spoken: the script without its [[cue]] markers. */
const spokenOf = (text) =>
  text
    .replace(/\[\[[^\]]*\]\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function checkCue(lang, cue) {
  const { lab, arg } = cue.do ?? {};
  const ok =
    (lab === 'top' && !arg) ||
    (lab === 'step' && ['1', '2', '3'].includes(arg)) ||
    (lab === 'section' && SECTIONS.has(arg)) ||
    (lab === 'card' && slugs.has(arg));
  if (!ok) problems.push(`${lang}: unknown cue ${JSON.stringify(cue.do)}`);
}

const have = {};
for (const file of fs.readdirSync(path.join(ROOT, 'narration')).filter((f) => f.endsWith('.json'))) {
  const lang = file.replace(/\.json$/, '');
  const script = JSON.parse(fs.readFileSync(path.join(ROOT, 'narration', file), 'utf8'));
  for (const seg of script.segments)
    for (const m of seg.text.matchAll(/\[\[lab:([^:\]]+)(?::([^\]]*))?\]\]/g))
      checkCue(lang, { do: { lab: m[1], arg: m[2] } });

  const dir = path.join(ROOT, 'public/audio', lang);
  const manifestPath = path.join(dir, 'manifest.json');
  have[lang] = fs.existsSync(manifestPath);
  if (!have[lang]) {
    console.log(`narration: no audio for ${lang} yet, the guided tour is not offered in ${lang}`);
    continue;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.lang !== lang) problems.push(`${lang}: the manifest is for "${manifest.lang}"`);
  if (!/^eleven_/.test(manifest.model ?? '')) problems.push(`${lang}: the manifest was not made by generate.mjs`);
  const ids = new Set();
  for (const seg of manifest.segments) {
    ids.add(seg.id);
    if (!fs.existsSync(path.join(dir, seg.file))) problems.push(`${lang}: missing audio file ${seg.file}`);
    const source = script.segments.find((s) => s.id === seg.id);
    if (!source) problems.push(`${lang}: ${seg.id} is in the manifest, not in the script`);
    else if (seg.chars !== spokenOf(source.text).length)
      problems.push(`${lang}: ${seg.id} changed since the audio was made (run npm run narration)`);
    for (const cue of seg.cues) checkCue(lang, cue);
  }
  for (const seg of script.segments)
    if (!ids.has(seg.id)) problems.push(`${lang}: ${seg.id} is in the script, not in the manifest`);
}

const langs = Object.keys(have);
if (langs.some((l) => have[l]) && langs.some((l) => !have[l]))
  problems.push(
    `the tour has audio in ${langs.filter((l) => have[l])} but not in ${langs.filter((l) => !have[l])}: ship both`,
  );

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  process.exit(1);
}
