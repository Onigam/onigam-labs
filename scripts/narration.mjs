// Makes (or remakes) the audio of the guided tour with the local voice: Qwen3-TTS through Voicebox, no credit.
//   npm run narration -- --dry-run        what it would make, calls nothing
//   npm run narration                     generates both languages (Voicebox open, profiles Onigam narrateur FR and EN)
//   npm run narration -- --lang fr        one language only
// A segment is only generated again when its text or the voice changed. VOICEBOX_SEED gives another take of a bad clip.
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
    [
      'tools/narration/generate.mjs',
      '--src',
      `narration/${lang}.json`,
      '--out',
      `public/audio/${lang}`,
      '--engine',
      'voicebox',
      ...pass,
    ],
    { cwd: ROOT, stdio: 'inherit' },
  );
  status ||= r.status ?? 1;
}
process.exit(status);
