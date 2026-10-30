import type { Lang } from '../data/schema';
import { DICTS } from '../i18n';

const THEME_KEY = 'onigam-labs:theme';
export const LANG_KEY = 'onigam-labs:lang';

const safe = (fn: () => void): void => {
  try {
    fn();
  } catch {
    /* storage can be blocked: the choice then lasts for the visit only */
  }
};

/** Theme toggle, language memory, mobile menu, the line under the header once the page has scrolled. */
export function initHeader(root: HTMLElement, lang: Lang): void {
  const t = DICTS[lang].a11y;
  const html = document.documentElement;
  const header = root.querySelector<HTMLElement>('[data-header]');

  // theme
  const toggle = root.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = (): boolean => (html.dataset.theme ? html.dataset.theme === 'dark' : dark.matches);
  const label = (): void => toggle?.setAttribute('aria-label', isDark() ? t.themeToLight : t.themeToDark);
  label();
  dark.addEventListener('change', label);
  toggle?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    html.dataset.theme = next;
    safe(() => localStorage.setItem(THEME_KEY, next));
    label();
  });

  // the language chosen here is the one the root page will open in next time
  root
    .querySelectorAll<HTMLAnchorElement>('[data-lang]')
    .forEach((a) =>
      a.addEventListener('click', () => safe(() => localStorage.setItem(LANG_KEY, a.dataset.lang as string))),
    );
  safe(() => localStorage.setItem(LANG_KEY, lang));

  // menu on small screens
  const menu = root.querySelector<HTMLButtonElement>('[data-menu]');
  const nav = root.querySelector<HTMLElement>('[data-nav]');
  const setMenu = (open: boolean): void => {
    nav?.toggleAttribute('data-open', open);
    menu?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-label', open ? t.menuClose : t.menu);
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });

  const scrolled = (): void => void header?.toggleAttribute('data-scrolled', scrollY > 8);
  addEventListener('scroll', scrolled, { passive: true });
  scrolled();
}
