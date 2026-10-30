// Fails the build when a lab entry is incomplete, so an unfinished lab never reaches the site (like the narration
// manifest check in the labs). Rules live in src/data/schema.ts; here we add what needs the file system.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, THUMB_WIDTHS, validateLab } from '../src/data/schema.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'src/data/labs');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
let problems = 0;
const counts = { live: 0, building: 0, planned: 0 };

for (const f of files) {
  const slug = f.replace(/\.json$/, '');
  let entry;
  try {
    entry = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  } catch (e) {
    console.error(`✗ ${f}: not valid JSON (${e.message})`);
    problems++;
    continue;
  }
  const errors = validateLab(entry, slug);
  if (entry.thumbnail) {
    for (const lang of LANGS)
      for (const w of THUMB_WIDTHS) {
        const img = `public/labs/${entry.thumbnail}-${lang}-${w}.webp`;
        if (!fs.existsSync(path.join(ROOT, img)))
          errors.push(`missing thumbnail ${img} (run \`npm run add-lab ${slug} --capture-only\`)`);
      }
  }
  if (errors.length) {
    console.error(`✗ ${f}`);
    errors.forEach((e) => console.error(`    - ${e}`));
    problems += errors.length;
  } else counts[entry.status]++;
}

if (problems) {
  console.error(`\n${problems} problem(s) in the lab entries.`);
  process.exit(1);
}
console.log(`labs ok: ${counts.live} online, ${counts.building} in progress, ${counts.planned} planned`);
