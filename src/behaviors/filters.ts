import type { Lang } from '../data/schema';
import { DICTS } from '../i18n';

/** Filter the gallery by domain. Without JavaScript the filter bar stays hidden and every lab shows. */
export function initFilters(root: HTMLElement, lang: Lang): void {
  const bar = root.querySelector<HTMLElement>('[data-filters]');
  if (!bar) return;
  bar.hidden = false;
  const buttons = [...bar.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-lab]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-group]')];
  const status = root.querySelector<HTMLElement>('[data-result]');
  const t = DICTS[lang].labs;

  const apply = (filter: string): void => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    let shown = 0;
    for (const item of items) {
      const match = filter === 'all' || (item.dataset.domains ?? '').split(' ').includes(filter);
      item.hidden = !match;
      if (match) shown++;
    }
    for (const group of groups) {
      const visible = group.querySelectorAll('[data-lab]:not([hidden])').length;
      group.hidden = visible === 0;
      const count = group.querySelector('[data-group-count]');
      if (count) count.textContent = String(visible);
    }
    if (status) status.textContent = t.resultCount(shown);
  };

  bar.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (b) apply(b.dataset.filter ?? 'all');
  });
}
