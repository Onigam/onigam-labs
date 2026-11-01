// Build-time entry (vite build --ssr): turns the data and the dictionaries into the page of each language.
import { LABS } from './data/labs';
import type { Lang } from './data/schema';
import { DICTS, PATHS, PRIVACY_PATHS } from './i18n';
import { renderPrivacy } from './render/privacy';
import { SITE, renderPage } from './render/page';

export { LABS, DICTS, PATHS, PRIVACY_PATHS, SITE, renderPrivacy };
export const render = (lang: Lang, year: number, tour?: number): string => renderPage(lang, year, tour);
