import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LABS } from './data/labs';

interface Script {
  lang: string;
  segments: { id: string; scope: string; title: string; text: string }[];
}
const load = (lang: string): Script =>
  JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'narration', `${lang}.json`), 'utf8'));
const scripts = { fr: load('fr'), en: load('en') };

const text = (s: Script): string => s.segments.map((x) => x.text).join(' ');
const cues = (s: Script): string[] => [...text(s).matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]);
const spoken = (s: Script): string =>
  text(s)
    .replace(/\[\[[^\]]*\]\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

describe('the spoken tour scripts', () => {
  it('have the same segments and the same cues in the same order', () => {
    expect(scripts.en.segments.map((s) => s.id)).toEqual(scripts.fr.segments.map((s) => s.id));
    expect(cues(scripts.en)).toEqual(cues(scripts.fr));
  });
  it('only use cues the page understands, on things that exist', () => {
    const slugs = new Set(LABS.map((l) => l.slug));
    for (const cue of cues(scripts.fr)) {
      const [kind, name, arg] = cue.split(':');
      expect(kind).toBe('lab');
      if (name === 'top') continue;
      if (name === 'step') expect(['1', '2', '3']).toContain(arg);
      else if (name === 'section') expect(['labs', 'planned', 'inside', 'about']).toContain(arg);
      else if (name === 'card') expect(slugs.has(arg), `no lab ${arg}`).toBe(true);
      else throw new Error(`unknown cue ${cue}`);
    }
  });
  it.each(['fr', 'en'] as const)('(%s) are written to be spoken', (lang) => {
    const s = spoken(scripts[lang]);
    expect(s).not.toMatch(/[0-9%€$&@#*/=+<>_]/); // numbers in words, no symbols
    expect(s).not.toContain("'"); // typographic apostrophes
    expect(s.length).toBeLessThan(2500); // the generator's limit per segment
    expect(s).toMatch(lang === 'fr' ? /voix de synthèse/ : /synthetic voice/);
  });
  it.each(['fr', 'en'] as const)('(%s) never move the page twice in a breath', (lang) => {
    // at most one move every 35 spoken characters, as in the labs' style guide
    let at = -Infinity;
    let spokenSoFar = 0;
    for (const part of text(scripts[lang]).split(/(\[\[[^\]]*\]\])/)) {
      if (part.startsWith('[[')) {
        expect(spokenSoFar - at, `cue ${part}`).toBeGreaterThanOrEqual(35);
        at = spokenSoFar;
      } else spokenSoFar += part.replace(/\s+/g, ' ').length;
    }
  });
  it('speak of the same labs the site shows', () => {
    const slugs = cues(scripts.fr).filter((c) => c.startsWith('lab:card:'));
    expect(slugs.length).toBeGreaterThan(0);
  });
});
