import './styles/index.css';
import { DICTS, langFromPath } from './i18n';
import { initFilters } from './behaviors/filters';
import { initHeader } from './behaviors/header';
import { initStory } from './behaviors/story';

const app = document.getElementById('app') as HTMLElement;
const lang = langFromPath(location.pathname);

// In production the page is already in the HTML (prerendered, see scripts/prerender.mjs). In dev it is drawn here,
// and the renderer is left out of the production script.
if (import.meta.env.DEV && !app.hasAttribute('data-prerendered')) {
  const { renderPage } = await import('./render/page');
  document.documentElement.classList.add('js');
  document.documentElement.lang = lang;
  document.title = DICTS[lang].meta.title;
  app.innerHTML = renderPage(lang);
}

initHeader(app, lang);
const hero = app.querySelector<HTMLElement>('[data-story]');
if (hero) initStory(hero);
initFilters(app, lang);
