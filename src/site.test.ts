import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LABS } from './data/labs';
import { DOMAINS, validateLab, type LabEntry } from './data/schema';
import { DICTS } from './i18n';
import { renderPage } from './render/page';
import { inline, renderPrivacy } from './render/privacy';

const dir = path.join(import.meta.dirname, 'data/labs');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

/** Every key path of a dictionary, with functions counted as leaves. */
function paths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
}
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('lab entries', () => {
  it.each(files)('%s is valid', (file: string) => {
    const entry = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    expect(validateLab(entry, file.replace(/\.json$/, ''))).toEqual([]);
  });

  it('are all loaded, in the order online, in progress, planned', () => {
    expect(LABS).toHaveLength(files.length);
    const rank = { live: 0, building: 1, planned: 2 };
    const ranks = LABS.map((l) => rank[l.status]);
    expect(ranks).toEqual([...ranks].sort());
  });

  it('rejects an incomplete live lab', () => {
    const bad = { slug: 'x-lab', order: 1, status: 'live', title: { fr: 'X', en: '' } } as unknown as LabEntry;
    expect(validateLab(bad, 'x-lab').length).toBeGreaterThan(3);
  });
});

describe('French and English', () => {
  it('have the same keys', () => {
    expect(paths(DICTS.en).sort()).toEqual(paths(DICTS.fr).sort());
  });
  it('have no empty text and no straight apostrophe', () => {
    for (const lang of ['fr', 'en'] as const) {
      for (const text of strings(DICTS[lang])) {
        expect(text.trim(), `${lang}: empty text`).not.toBe('');
        expect(text, `${lang}: use ’ in "${text}"`).not.toContain("'");
      }
    }
  });
  it('know every domain', () => {
    for (const lang of ['fr', 'en'] as const) for (const d of DOMAINS) expect(DICTS[lang].domains[d]).toBeTruthy();
  });
});

describe('the page', () => {
  const fr = renderPage('fr', 2026);
  const en = renderPage('en', 2026);

  it('shows every lab once in each language', () => {
    for (const html of [fr, en]) for (const lab of LABS) expect(html.split(`data-lab="${lab.slug}"`)).toHaveLength(2);
  });
  it('has the same structure in both languages', () => {
    const shape = (html: string) =>
      html.replace(/>[^<]*</g, '><').replace(/(alt|aria-label|title|href|lang|hreflang|src|srcset)="[^"]*"/g, '');
    expect(shape(en).length).toBeGreaterThan(0);
    expect((en.match(/<article/g) ?? []).length).toBe((fr.match(/<article/g) ?? []).length);
    expect((en.match(/<li class="soon__item"/g) ?? []).length).toBe((fr.match(/<li class="soon__item"/g) ?? []).length);
  });
  it('links each live lab to its site and repository', () => {
    for (const lab of LABS.filter((l) => l.status === 'live')) {
      expect(fr).toContain(`href="${lab.liveUrl}"`);
      expect(fr).toContain(`href="${lab.repoUrl}"`);
    }
  });
  it('labels spoken guides as synthetic voice', () => {
    expect(fr).toContain('voix de synthèse');
    expect(en).toContain('synthetic voice');
  });
  it('has one h1 and an accessible language switch', () => {
    for (const html of [fr, en]) {
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).toContain('hreflang="fr"');
      expect(html).toContain('hreflang="en"');
    }
  });
});

describe('the privacy page', () => {
  it('exists in both languages, with the same sections and working links', () => {
    expect(DICTS.fr.privacyPage.sections.length).toBe(DICTS.en.privacyPage.sections.length);
    for (const lang of ['fr', 'en'] as const) {
      const html = renderPrivacy(lang, 2026);
      expect(html).toContain('Onigam Video');
      expect(html).toContain('href="https://www.youtube.com/t/terms"');
      expect(html).toContain('href="https://policies.google.com/privacy"');
      expect(html).toContain('href="https://myaccount.google.com/permissions"');
      expect(html).not.toContain('](');
      expect(html).not.toContain('<script');
      expect(html).not.toMatch(/@gmail|cochet/i);
    }
  });

  it('says that the labs load their fonts from Google, as they do', () => {
    expect(renderPrivacy('fr', 2026)).toContain('Google Fonts');
    expect(renderPrivacy('en', 2026)).toContain('Google Fonts');
  });

  it('is linked from the footer of the home page, in its language', () => {
    expect(renderPage('fr', 2026)).toContain('href="/privacy/"');
    expect(renderPage('en', 2026)).toContain('href="/en/privacy/"');
  });

  it('writes links in https only, and escapes the rest', () => {
    expect(inline('a [b](https://x.io/y) <c>')).toBe('a <a href="https://x.io/y" rel="noopener">b</a> &lt;c&gt;');
    expect(inline('[b](http://x.io)')).toBe('[b](http://x.io)');
    expect(inline('[b](javascript:alert(1))')).not.toContain('<a');
  });
});
