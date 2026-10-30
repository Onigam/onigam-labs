import { LABS } from '../data/labs';
import { DOMAINS, THUMB_WIDTHS, type Domain, type LabEntry, type Lang, type Status } from '../data/schema';
import { DICTS, PATHS, type Dict } from '../i18n';
import { esc } from './html';
import { clock } from './format';
import { ICONS, markSvg } from './icons';
import { runnerSvg } from './runner';

export const SITE = {
  repo: 'https://github.com/Onigam/onigam-labs',
  profile: 'https://github.com/Onigam',
  kit: 'https://github.com/Onigam/lab-kit',
};

const LANG_NAMES: Record<Lang, string> = { fr: 'FR', en: 'EN' };

function header(lang: Lang, t: Dict, tour?: number): string {
  const langLinks = (['fr', 'en'] as const)
    .map((l) => {
      const current = l === lang;
      return `<a href="${PATHS[l]}" lang="${l}" hreflang="${l}" data-lang="${l}"${current ? ' aria-current="true"' : ''} aria-label="${esc(DICTS[l].a11y.switchTo)}">${LANG_NAMES[l]}</a>`;
    })
    .join('');
  return `<header class="site-header" data-header>
  <div class="wrap bar">
    <a class="brand" href="#top" aria-label="${esc(t.a11y.home)}">${markSvg()}<span>Onigam Labs</span></a>
    <nav class="nav" id="nav" aria-label="${esc(t.a11y.mainNav)}" data-nav>
      <a href="#labs">${esc(t.nav.labs)}</a>
      <a href="#inside">${esc(t.nav.inside)}</a>
      <a href="#about">${esc(t.nav.about)}</a>
    </nav>
    <div class="tools">
      <div class="lang" role="group" aria-label="${esc(t.a11y.language)}">${langLinks}</div>
      ${tour ? `<button class="icon-btn tour-btn" type="button" data-tour-start aria-label="${esc(t.tour.headerAria)}">${ICONS.speaker}</button>` : ''}
      <button class="icon-btn theme" type="button" data-theme-toggle aria-label="${esc(t.a11y.themeToDark)}" data-label-dark="${esc(t.a11y.themeToDark)}" data-label-light="${esc(t.a11y.themeToLight)}">${ICONS.sun}${ICONS.moon}</button>
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="${esc(t.a11y.menu)}" data-menu data-label-open="${esc(t.a11y.menu)}" data-label-close="${esc(t.a11y.menuClose)}">${ICONS.menu}${ICONS.close}</button>
    </div>
  </div>
</header>`;
}

function hero(t: Dict, tour?: number): string {
  const steps = t.hero.steps
    .map(
      (s, i) => `<li class="step" data-step="${i + 1}">
        <button class="step__tab" type="button" data-step-go="${i + 1}"><span class="step__bar" aria-hidden="true"><i></i></span><span class="step__name">${esc(s.name)}</span></button>
        <p>${esc(s.text)}</p>
      </li>`,
    )
    .join('');
  return `<section class="hero" id="top" data-story aria-labelledby="hero-title">
  <div class="hero__pin">
    <div class="wrap hero__grid">
      <div class="hero__copy">
        <h1 class="display" id="hero-title">${esc(t.hero.title)}</h1>
        <p class="lead">${esc(t.hero.lead)}</p>
        <div class="cta">
          <a class="btn btn--primary" href="#labs">${esc(t.hero.primary)}</a>
          ${tour ? `<button class="btn btn--tour" type="button" data-tour-start aria-label="${esc(t.tour.buttonAria(clock(tour)))}">${ICONS.speaker}${esc(t.tour.button)}<span class="mono">${clock(tour)}</span></button>` : ''}
          <a class="btn${tour ? ' btn--quiet' : ''}" href="${SITE.repo}">${ICONS.github}${esc(t.hero.secondary)}</a>
        </div>
      </div>
      <div class="hero__figure">
        <div class="runner" data-runner aria-hidden="true">${runnerSvg(t.hero.drawing)}</div>
        <ol class="steps" aria-label="${esc(t.hero.stepsLabel)}">${steps}</ol>
      </div>
    </div>
  </div>
</section>`;
}

const DOMAIN_ORDER: readonly Domain[] = DOMAINS;

function chips(lab: LabEntry, t: Dict): string {
  const domains = DOMAIN_ORDER.filter((d) => lab.domains.includes(d)).map(
    (d) => `<li class="chip chip--${d}"><i aria-hidden="true"></i>${esc(t.domains[d])}</li>`,
  );
  const tags = lab.tags.map((tag) => `<li class="chip chip--tag">${esc(t.tags[tag] ?? tag)}</li>`);
  return `<ul class="chips">${domains.join('')}${tags.join('')}</ul>`;
}

function langs(lab: LabEntry): string {
  return lab.languages.map((l) => `<span lang="${l}">${LANG_NAMES[l]}</span>`).join('');
}

function pips(level: number): string {
  return `<span class="pips" aria-hidden="true">${[1, 2, 3].map((n) => `<i${n <= level ? ' class="on"' : ''}></i>`).join('')}</span>`;
}

function plate(lab: LabEntry, t: Dict): string {
  const spoken = lab.spokenGuide.length
    ? `<span class="spoken">${ICONS.speaker}<span class="mono">${lab.spokenGuide.map((l) => LANG_NAMES[l]).join(' ')}</span></span><small>${esc(t.card.spokenNote)}</small>`
    : `<span class="muted">${esc(t.card.spokenNone)}</span>`;
  return `<dl class="plate">
    <div><dt>${esc(t.card.level)}</dt><dd>${lab.difficulty ? `${pips(lab.difficulty)}<span>${esc(t.difficulty[lab.difficulty])}</span>` : ''}</dd></div>
    <div><dt>${esc(t.card.time)}</dt><dd class="mono">${lab.minutes ? esc(t.card.minutes(lab.minutes)) : ''}</dd></div>
    <div><dt>${esc(t.card.languages)}</dt><dd class="mono">${langs(lab)}</dd></div>
    <div><dt>${esc(t.card.spoken)}</dt><dd class="dd-spoken">${spoken}</dd></div>
  </dl>`;
}

function thumb(lab: LabEntry, lang: Lang): string {
  if (!lab.thumbnail) return '';
  const [small, large] = THUMB_WIDTHS;
  const base = `/labs/${lab.thumbnail}-${lang}`;
  return `<img src="${base}-${small}.webp" srcset="${base}-${small}.webp ${small}w, ${base}-${large}.webp ${large}w" sizes="(min-width: 1100px) 390px, (min-width: 700px) 46vw, 92vw" width="${small}" height="${Math.round((small * 3) / 4)}" alt="" loading="lazy" decoding="async">`;
}

function card(lab: LabEntry, lang: Lang, t: Dict): string {
  const title = lab.title[lang];
  const live = lab.status === 'live';
  const shot = live
    ? `<a class="lab__shot" href="${esc(lab.liveUrl ?? '#')}" tabindex="-1" aria-hidden="true">${thumb(lab, lang)}</a>`
    : `<div class="lab__shot lab__shot--empty" aria-hidden="true"><span class="mono">${esc(t.card.inProgress)}</span></div>`;
  const actions = live
    ? `<a class="btn btn--primary" href="${esc(lab.liveUrl ?? '#')}">${esc(t.card.open)}<span class="vh">${esc(t.card.forLab(title))}</span></a>
       <a class="btn" href="${esc(lab.repoUrl ?? '#')}">${ICONS.github}${esc(t.card.source)}<span class="vh">${esc(t.card.forLab(title))}</span></a>`
    : `<a class="btn" href="${esc(lab.repoUrl ?? '#')}">${ICONS.github}${esc(t.card.follow)}<span class="vh">${esc(t.card.forLab(title))}</span></a>`;
  return `<article class="lab lab--${lab.status}" data-lab="${esc(lab.slug)}" data-domains="${lab.domains.join(' ')}">
  ${shot}
  <div class="lab__body">
    <h4 class="lab__title">${esc(title)}</h4>
    <p class="lab__tagline">${esc(lab.tagline[lang])}</p>
    ${chips(lab, t)}
    ${plate(lab, t)}
    <div class="lab__actions">${actions}</div>
  </div>
</article>`;
}

function soonItem(lab: LabEntry, lang: Lang, t: Dict): string {
  const dots = DOMAIN_ORDER.filter((d) => lab.domains.includes(d))
    .map((d) => `<i class="dot dot--${d}" title="${esc(t.domains[d])}"></i>`)
    .join('');
  const names = DOMAIN_ORDER.filter((d) => lab.domains.includes(d))
    .map((d) => t.domains[d])
    .join(', ');
  return `<li class="soon__item" data-lab="${esc(lab.slug)}" data-domains="${lab.domains.join(' ')}">
    <span class="soon__dots" aria-hidden="true">${dots}</span>
    <div><h4>${esc(lab.title[lang])}</h4><p>${esc(lab.tagline[lang])}</p><p class="vh">${esc(names)}</p></div>
    <span class="soon__tag mono">${esc(t.card.soon)}</span>
  </li>`;
}

function group(status: Status, labs: LabEntry[], lang: Lang, t: Dict): string {
  const list = labs.filter((l) => l.status === status);
  if (!list.length) return '';
  const note = status === 'planned' ? t.labs.plannedNote : status === 'building' ? t.labs.buildingNote : '';
  const body =
    status === 'planned'
      ? `<ul class="soon">${list.map((l) => soonItem(l, lang, t)).join('')}</ul>`
      : `<div class="grid grid--${status}">${list.map((l) => card(l, lang, t)).join('')}</div>`;
  return `<div class="group" data-group="${status}">
    <div class="group__head"><h3>${esc(t.labs.groups[status])}</h3><span class="count mono" data-group-count>${list.length}</span>${note ? `<p>${esc(note)}</p>` : ''}</div>
    ${body}
  </div>`;
}

function labsSection(lang: Lang, t: Dict): string {
  const used = DOMAIN_ORDER.filter((d) => LABS.some((l) => l.domains.includes(d)));
  const filters = [
    `<button class="filter" type="button" aria-pressed="true" data-filter="all">${esc(t.labs.all)}</button>`,
    ...used.map(
      (d) =>
        `<button class="filter filter--${d}" type="button" aria-pressed="false" data-filter="${d}"><i aria-hidden="true"></i>${esc(t.domains[d])}</button>`,
    ),
  ].join('');
  return `<section class="section" id="labs" aria-labelledby="labs-title">
  <div class="wrap">
    <header class="section__head">
      <h2 class="display" id="labs-title">${esc(t.labs.title)}</h2>
      <p class="lead">${esc(t.labs.lead)}</p>
    </header>
    <div class="filters" role="group" aria-label="${esc(t.labs.filterLabel)}" data-filters hidden>${filters}</div>
    <p class="vh" role="status" aria-live="polite" data-result></p>
    <div class="groups">
      ${group('live', LABS, lang, t)}
      ${group('building', LABS, lang, t)}
      ${group('planned', LABS, lang, t)}
    </div>
  </div>
</section>`;
}

function insideSection(t: Dict): string {
  const rows = t.inside.items
    .map((i) => `<div class="nomen__row"><dt>${esc(i.name)}</dt><dd>${esc(i.text)}</dd></div>`)
    .join('');
  return `<section class="section" id="inside" aria-labelledby="inside-title">
  <div class="wrap split">
    <header class="section__head">
      <h2 class="display" id="inside-title">${esc(t.inside.title)}</h2>
      <p class="lead">${esc(t.inside.lead)}</p>
    </header>
    <dl class="nomen">${rows}</dl>
  </div>
</section>`;
}

function sourcesList(lang: Lang): string {
  return LABS.filter((l) => l.sources.length)
    .map((lab) => {
      const items = lab.sources
        .map(
          (s) =>
            `<li><a href="${esc(s.url)}">${esc(s.title)}</a><span>${esc(s.author)}${s.year ? `, ${s.year}` : ''}</span></li>`,
        )
        .join('');
      return `<div class="src"><h4>${esc(lab.title[lang])}</h4><ul>${items}</ul></div>`;
    })
    .join('');
}

function aboutSection(lang: Lang, t: Dict): string {
  return `<section class="section" id="about" aria-labelledby="about-title">
  <div class="wrap split">
    <header class="section__head">
      <h2 class="display" id="about-title">${esc(t.about.title)}</h2>
      <div class="prose">${t.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </header>
    <div class="about__side">
      <h3>${esc(t.about.sourcesTitle)}</h3>
      <p class="muted">${esc(t.about.sourcesLead)}</p>
      <div class="srcs">${sourcesList(lang)}</div>
      <h3>${esc(t.about.openTitle)}</h3>
      <p class="muted">${esc(t.about.openText)}</p>
      <p class="links"><a class="btn" href="${SITE.kit}">${ICONS.github}${esc(t.about.kit)}</a><a class="btn" href="${SITE.profile}">${ICONS.github}${esc(t.about.profile)}</a></p>
    </div>
  </div>
</section>`;
}

function footer(t: Dict, year: number): string {
  return `<footer class="site-footer">
  <div class="wrap foot">
    <div class="foot__legal"><span>© ${year} Magino</span><span>${esc(t.footer.licence)}</span><span>${esc(t.footer.privacy)}</span></div>
    <div class="foot__links">
      <a href="${SITE.repo}">${esc(t.hero.secondary)}</a>
      <a href="#top">${esc(t.a11y.backToTop)}</a>
    </div>
  </div>
</footer>`;
}

/** The whole page body for one language. Rendered at build time (prerender) and, in dev, in the browser. */
/** `tour` is the length in seconds of the spoken tour when its audio exists (no audio, no button). */
export function renderPage(lang: Lang, year = new Date().getFullYear(), tour?: number): string {
  const t = DICTS[lang];
  return `<a class="skip" href="#main">${esc(t.a11y.skip)}</a>
${header(lang, t, tour)}
<main id="main">
${hero(t, tour)}
${labsSection(lang, t)}
${insideSection(t)}
${aboutSection(lang, t)}
</main>
${footer(t, year)}`;
}
