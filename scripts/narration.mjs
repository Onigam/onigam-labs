// Makes (or remakes) the audio of the guided tour with the same ElevenLabs voice as the labs.
//   npm run narration -- --dry-run        what it would cost, calls nothing (0 credit)
//   npm run narration                     generates both languages (spends credits: the owner says yes first)
//   npm run narration -- --lang fr        one language only
// A segment is only generated again when its text, the voice or the settings changed: a hash cache never bills the same
// text twice. The key lives in ~/.config/lab-narration/elevenlabs.env, never in this repository.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = args.includes('--lang') ? [args[args.indexOf('--lang') + 1]] : ['fr', 'en'];
const pass = args.filter((a, i) => a !== '--lang' && args[i - 1] !== '--lang');
let status = 0;
for (const lang of only) {
  console.log(`\n== ${lang}`);
  const r = spawnSync(
    process.execPath,
    ['tools/narration/generate.mjs', '--src', `narration/${lang}.json`, '--out', `public/audio/${lang}`, ...pass],
    { cwd: ROOT, stdio: 'inherit' },
  );
  status ||= r.status ?? 1;
}
process.exit(status);
