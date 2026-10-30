// Build-time entry (vite build --ssr): turns the data and the dictionaries into the page of each language.
import { LABS } from './data/labs';
import type { Lang } from './data/schema';
import { DICTS, PATHS } from './i18n';
import { SITE, renderPage } from './render/page';

export { LABS, DICTS, PATHS, SITE };
export const render = (lang: Lang, year: number): string => renderPage(lang, year);
