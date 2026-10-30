import { en } from './en';
import { fr, type Dict } from './fr';
import type { Lang } from '../data/schema';

export type { Dict };
export const DICTS: Record<Lang, Dict> = { fr, en };

/** French lives at `/`, English at `/en/`. */
export const PATHS: Record<Lang, string> = { fr: '/', en: '/en/' };

export function langFromPath(pathname: string): Lang {
  return pathname.startsWith('/en') ? 'en' : 'fr';
}
