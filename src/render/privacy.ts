import type { Lang } from '../data/schema';
import { DICTS, PATHS, PRIVACY_PATHS, type Dict } from '../i18n';
import { esc } from './html';
import { markSvg } from './icons';

/** A paragraph of the dictionary: plain text, with [label](https://…) for a link. */
export function inline(text: string): string {
  return text
    .split(/(\[[^\]]+\]\(https:\/\/[^)\s]+\))/)
    .map((part) => {
      const m = /^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/.exec(part);
      return m ? `<a href="${esc(m[2]!)}" rel="noopener">${esc(m[1]!)}</a>` : esc(part);
    })
    .join('');
}

function bar(lang: Lang, t: Dict): string {
  const links = (['fr', 'en'] as const)
    .map(
      (l) =>
        `<a href="${PRIVACY_PATHS[l]}" lang="${l}" hreflang="${l}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`,
    )
    .join('');
  return `<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="${PATHS[lang]}" aria-label="${esc(t.a11y.home)}">${markSvg()}<span>Onigam Labs</span></a>
    <div class="tools"><div class="lang" role="group" aria-label="${esc(t.a11y.language)}">${links}</div></div>
  </div>
</header>`;
}

/** The privacy page of one language: plain HTML, no script of its own. */
export function renderPrivacy(lang: Lang, year = new Date().getFullYear()): string {
  const t = DICTS[lang];
  const p = t.privacyPage;
  return `<a class="skip" href="#main">${esc(t.a11y.skip)}</a>
${bar(lang, t)}
<main id="main" class="privacy wrap">
  <h1>${esc(p.title)}</h1>
  <p class="privacy__updated">${esc(p.updated)}</p>
  ${p.sections
    .map(
      (s) => `<section>
    <h2>${esc(s.title)}</h2>
    ${s.paragraphs.map((x) => `<p>${inline(x)}</p>`).join('\n    ')}
  </section>`,
    )
    .join('\n  ')}
  <p><a href="${PATHS[lang]}">${esc(p.back)}</a></p>
</main>
<footer class="site-footer">
  <div class="wrap foot">
    <div class="foot__legal"><span>© ${year} Magino</span><span>${esc(t.footer.licence)}</span></div>
  </div>
</footer>`;
}
