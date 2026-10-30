// The shape of one lab entry (src/data/labs/<slug>.json) and the rules every entry must follow.
// Imported by the site, by `check-labs`, by `add-lab` and by the tests: Node runs this file as is (types are erased).

export type Lang = 'fr' | 'en';
export type Bilingual = { fr: string; en: string };
export type Domain = 'electricity' | 'heat' | 'water' | 'storage';
export type Status = 'live' | 'building' | 'planned';

export const LANGS: readonly Lang[] = ['fr', 'en'];
export const DOMAINS: readonly Domain[] = ['electricity', 'heat', 'water', 'storage'];
export const STATUSES: readonly Status[] = ['live', 'building', 'planned'];

export interface LabSource {
  title: string;
  author: string;
  url: string;
  year?: number;
}

export interface LabEntry {
  slug: string;
  /** Position inside its status group (smaller first). */
  order: number;
  status: Status;
  title: Bilingual;
  tagline: Bilingual;
  domains: Domain[];
  /** Free tags (wind, off-grid…), translated by the site when it knows them. */
  tags: string[];
  /** 1 accessible, 2 intermediate, 3 advanced. Required once a lab is online or in progress. */
  difficulty?: 1 | 2 | 3;
  /** Time to discover the lab. */
  minutes?: number;
  languages: Lang[];
  /** Languages that have a spoken guide (synthetic voice). */
  spokenGuide: Lang[];
  liveUrl?: string;
  repoUrl?: string;
  /** Base name of the files in public/labs/: <thumbnail>-<lang>-720.webp and <thumbnail>-<lang>-1280.webp. */
  thumbnail?: string;
  /** How `add-lab` frames the thumbnail: which world, how exploded (0 to 1), in section or not. Not shown on the site. */
  capture?: { scene?: string; explode?: number; cutaway?: boolean; zoom?: number; focus?: [number, number] };
  sources: LabSource[];
}

export const THUMB_WIDTHS = [560, 1120] as const;

/** Online first, then in progress, then planned; `order` inside each group. */
export function sortLabs<T extends Pick<LabEntry, 'status' | 'order' | 'slug'>>(labs: readonly T[]): T[] {
  const rank: Record<Status, number> = { live: 0, building: 1, planned: 2 };
  return [...labs].sort((a, b) => rank[a.status] - rank[b.status] || a.order - b.order || a.slug.localeCompare(b.slug));
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isHttps = (v: unknown): v is string => typeof v === 'string' && /^https:\/\/[^\s/]+\.[^\s/]+/.test(v);

function checkBilingual(label: string, v: unknown, errors: string[]): void {
  if (!isObj(v)) return void errors.push(`${label}: expected { fr, en }`);
  for (const lang of LANGS) {
    if (!isText(v[lang])) errors.push(`${label}.${lang}: missing or empty (FR and EN must both be filled)`);
  }
}

/** Returns the list of problems (empty when the entry is valid). `fileSlug` is the file name without `.json`. */
export function validateLab(entry: unknown, fileSlug: string): string[] {
  const errors: string[] = [];
  if (!isObj(entry)) return ['the file must contain a JSON object'];
  const e = entry;

  if (!isText(e.slug) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) errors.push('slug: kebab-case text expected');
  else if (e.slug !== fileSlug) errors.push(`slug: "${e.slug}" does not match the file name "${fileSlug}.json"`);
  if (!Number.isInteger(e.order) || (e.order as number) < 0) errors.push('order: non-negative integer expected');
  if (!STATUSES.includes(e.status as Status)) errors.push(`status: one of ${STATUSES.join(', ')}`);
  checkBilingual('title', e.title, errors);
  checkBilingual('tagline', e.tagline, errors);

  if (!Array.isArray(e.domains) || e.domains.length === 0)
    errors.push('domains: at least one of ' + DOMAINS.join(', '));
  else if (e.domains.some((d) => !DOMAINS.includes(d as Domain))) errors.push(`domains: only ${DOMAINS.join(', ')}`);
  if (!Array.isArray(e.tags) || e.tags.some((t) => !isText(t))) errors.push('tags: array of text expected');
  if (!Array.isArray(e.languages) || e.languages.length === 0 || e.languages.some((l) => !LANGS.includes(l as Lang)))
    errors.push('languages: at least one of fr, en');
  if (!Array.isArray(e.spokenGuide) || e.spokenGuide.some((l) => !LANGS.includes(l as Lang)))
    errors.push('spokenGuide: array of fr / en (empty when there is no guide)');
  else if (Array.isArray(e.languages) && e.spokenGuide.some((l) => !(e.languages as unknown[]).includes(l)))
    errors.push('spokenGuide: a spoken guide language must also be in languages');

  if (!Array.isArray(e.sources)) errors.push('sources: array expected');
  else
    e.sources.forEach((s, i) => {
      if (!isObj(s) || !isText(s.title) || !isText(s.author) || !isHttps(s.url))
        errors.push(`sources[${i}]: { title, author, url (https) } expected`);
    });

  const online = e.status === 'live' || e.status === 'building';
  if (online) {
    if (![1, 2, 3].includes(e.difficulty as number)) errors.push('difficulty: 1, 2 or 3 expected');
    if (!Number.isInteger(e.minutes) || (e.minutes as number) <= 0) errors.push('minutes: positive integer expected');
    if (!isHttps(e.repoUrl)) errors.push('repoUrl: https URL expected');
  }
  if (e.status === 'live') {
    if (!isHttps(e.liveUrl)) errors.push('liveUrl: https URL expected for a live lab');
    if (!isText(e.thumbnail)) errors.push('thumbnail: run `npm run add-lab` to capture one');
    if (!Array.isArray(e.sources) || e.sources.length === 0)
      errors.push('sources: a live lab credits at least its main source');
  }
  if (e.status === 'planned' && (e.liveUrl || e.thumbnail))
    errors.push('a planned lab has no liveUrl or thumbnail yet');
  return errors;
}
