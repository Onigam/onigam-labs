import './styles/index.css';
import { DICTS, langFromPath } from './i18n';
import { initFilters } from './behaviors/filters';
import { initHeader } from './behaviors/header';
import { initStory } from './behaviors/story';
import { initTour } from './behaviors/tour';

const app = document.getElementById('app') as HTMLElement;
const lang = langFromPath(location.pathname);

// In production the page is already in the HTML (prerendered, see scripts/prerender.mjs). In dev it is drawn here,
// and the renderer is left out of the production script.
if (import.meta.env.DEV && !app.hasAttribute('data-prerendered')) {
  const { renderPage } = await import('./render/page');
  document.documentElement.classList.add('js');
  document.documentElement.lang = lang;
  document.title = DICTS[lang].meta.title;
  // the tour button only exists when the audio does (in production the prerender decides, from the manifest)
  const manifest = await fetch(`/audio/${lang}/manifest.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  app.innerHTML = renderPage(lang, undefined, manifest?.totalSeconds);
}

initHeader(app, lang);
const hero = app.querySelector<HTMLElement>('[data-story]');
const story = hero ? initStory(hero) : null;
initFilters(app, lang);
initTour(app, lang, story);
