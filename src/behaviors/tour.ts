// The spoken guided tour: a transport bar, subtitles, and a page that follows the voice. The audio is pre-rendered
// (tools/narration/generate.mjs, same voice as the labs), so nothing runs on a server and nothing starts by itself.
import type { Lang } from '../data/schema';
import { DICTS } from '../i18n';
import { ICONS } from '../render/icons';
import { clock } from '../render/format';
import { esc } from '../render/html';
import type { Story } from './story';

interface Cue {
  t: number;
  do: { lab?: string; arg?: string };
}
interface Segment {
  title: string;
  file: string;
  duration: number;
  captions: { t0: number; t1: number; text: string }[];
  cues: Cue[];
}
interface Manifest {
  segments: Segment[];
}

const PREFS_KEY = 'onigam-labs:tour';
const SPEEDS = [1, 1.25, 1.5];

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

/**
 * The cues of the tour move the page, they never block it:
 *   top · step:N · section:labs|planned|inside|about · card:<lab slug>
 */
export function initTour(root: HTMLElement, lang: Lang, story: Story | null): void {
  const starters = [...root.querySelectorAll<HTMLElement>('[data-tour-start]')];
  if (!starters.length) return;
  const t = DICTS[lang].tour;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const prefs = {
    speed: 1,
    captions: true,
    guidance: true,
    ...safe(() => JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}'), {}),
  };
  const savePrefs = (): void => safe(() => localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)), undefined);

  let seg: Segment | null = null;
  let audio: HTMLAudioElement | null = null;
  let bar: HTMLElement | null = null;
  let frame = 0;
  let lastCue = -1;
  let guided = true;
  let opener: HTMLElement | null = null;
  const el = {} as Record<'play' | 'seek' | 'time' | 'speed' | 'cc' | 'guide' | 'caption', HTMLElement>;

  const load = async (): Promise<Segment | null> => {
    if (seg) return seg;
    try {
      const res = await fetch(`/audio/${lang}/manifest.json`);
      const manifest = (await res.json()) as Manifest;
      seg = manifest.segments[0] ?? null;
    } catch {
      seg = null;
    }
    return seg;
  };

  // ---- the page follows the voice
  const clearHighlight = (): void => root.querySelectorAll('.is-tour').forEach((n) => n.classList.remove('is-tour'));
  const scrollTo = (target: Element | null, block: ScrollLogicalPosition): void =>
    target?.scrollIntoView({ block, behavior: reduce.matches ? 'auto' : 'smooth' });
  const apply = (cue: Cue['do']): void => {
    if (!guided) return;
    clearHighlight();
    const arg = cue.arg ?? '';
    switch (cue.lab) {
      case 'top':
        window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
        break;
      case 'step':
        story?.goStep(Number(arg) - 1);
        break;
      case 'section':
        scrollTo(root.querySelector(arg === 'planned' ? '[data-group="planned"]' : `#${arg}`), 'start');
        break;
      case 'card': {
        const card = root.querySelector<HTMLElement>(`[data-lab="${arg}"]`);
        if (card?.hidden) root.querySelector<HTMLElement>('[data-filter="all"]')?.click();
        if (!card) break;
        card.classList.add('is-tour');
        // centre the card in what the header and the bar leave free; a card taller than that starts under the header
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
        const free = innerHeight - header - (bar?.offsetHeight ?? 0) - 24;
        const top = card.getBoundingClientRect().top + scrollY - header - Math.max(16, (free - card.offsetHeight) / 2);
        window.scrollTo({ top, behavior: reduce.matches ? 'auto' : 'smooth' });
        break;
      }
    }
  };
  /** After a seek: put the page in the state of the last cue before `time`. */
  const replay = (time: number): void => {
    if (!seg) return;
    const past = seg.cues.filter((c) => c.t <= time);
    lastCue = past.length - 1;
    apply(past.at(-1)?.do ?? { lab: 'top' });
  };

  // ---- the bar
  const render = (): void => {
    if (!audio || !seg) return;
    const time = audio.currentTime;
    (el.seek as HTMLInputElement).value = String(time);
    el.time.textContent = `${clock(time)} / ${clock(seg.duration)}`;
    const cap = seg.captions.find((c) => time >= c.t0 && time < c.t1 + 0.25);
    el.caption.textContent = prefs.captions ? (cap?.text ?? '') : '';
    while (lastCue + 1 < seg.cues.length && seg.cues[lastCue + 1].t <= time) apply(seg.cues[++lastCue].do);
  };
  const loop = (): void => {
    render();
    frame = audio && !audio.paused && !audio.ended ? requestAnimationFrame(loop) : 0;
  };
  const setPlaying = (): void => {
    if (!audio) return;
    const ended = audio.ended;
    const label = ended ? t.replay : audio.paused ? t.play : t.pause;
    el.play.setAttribute('aria-label', label);
    el.play.dataset.state = ended ? 'ended' : audio.paused ? 'paused' : 'playing';
    if (!audio.paused && !frame) frame = requestAnimationFrame(loop);
    document.documentElement.toggleAttribute('data-tour-playing', !audio.paused && !audio.ended);
  };

  const setGuided = (on: boolean): void => {
    guided = on;
    el.guide.setAttribute('aria-pressed', String(on));
    bar?.toggleAttribute('data-detached', !on);
    if (on && audio) replay(audio.currentTime);
    if (!on) clearHighlight();
  };

  const close = (): void => {
    audio?.pause();
    audio = null;
    cancelAnimationFrame(frame);
    frame = 0;
    bar?.remove();
    bar = null;
    clearHighlight();
    document.documentElement.removeAttribute('data-tour');
    document.documentElement.removeAttribute('data-tour-playing');
    removeEventListener('keydown', onKey);
    removeEventListener('wheel', onHand);
    removeEventListener('touchstart', onHand);
    opener?.focus();
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') close();
    else if (
      ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key) &&
      !(e.target as HTMLElement).closest?.('.tour')
    )
      onHand();
  };
  /** The visitor scrolls by hand: the guidance lets go until they ask for it back. */
  const onHand = (): void => {
    if (guided && audio && !audio.paused) setGuided(false);
  };

  const build = (s: Segment): void => {
    bar = document.createElement('section');
    bar.className = 'tour';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', t.region);
    bar.innerHTML = `
      <p class="tour__caption" aria-live="polite"></p>
      <div class="tour__bar">
        <button class="tour__play" type="button" data-state="paused"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg><svg class="i-replay" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7M5 4v5.5h5.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="tour__info"><strong>${esc(s.title)}</strong><span>${ICONS.speaker}${esc(t.voice)}</span></div>
        <input class="tour__seek" type="range" min="0" max="${s.duration}" step="0.1" value="0" aria-label="${t.position}">
        <span class="tour__time mono" aria-hidden="true">0:00 / ${clock(s.duration)}</span>
        <button class="tour__chip tour__speed mono" type="button"></button>
        <button class="tour__chip tour__cc" type="button" aria-pressed="true">${t.captions}</button>
        <button class="tour__chip tour__guide" type="button" aria-pressed="true" title="${t.guidanceOn}">${t.guidance}</button>
        <button class="tour__close" type="button" aria-label="${t.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button>
      </div>
      <button class="tour__resume" type="button">${t.resume}</button>`;
    document.body.append(bar);
    const q = <T extends HTMLElement>(s: string): T => bar!.querySelector<T>(s)!;
    Object.assign(el, {
      play: q('.tour__play'),
      seek: q('.tour__seek'),
      time: q('.tour__time'),
      speed: q('.tour__speed'),
      cc: q('.tour__cc'),
      guide: q('.tour__guide'),
      caption: q('.tour__caption'),
    });
    const syncSpeed = (): void => {
      el.speed.textContent = `${prefs.speed}×`;
      el.speed.setAttribute('aria-label', t.speed(String(prefs.speed)));
      if (audio) audio.playbackRate = prefs.speed;
    };
    syncSpeed();
    el.cc.setAttribute('aria-pressed', String(prefs.captions));
    el.guide.setAttribute('aria-pressed', String(prefs.guidance));
    guided = prefs.guidance;
    bar.toggleAttribute('data-detached', !guided);

    el.play.addEventListener('click', () => {
      if (!audio) return;
      if (audio.ended) audio.currentTime = 0;
      if (audio.paused || audio.ended) {
        if (audio.currentTime === 0) lastCue = -1;
        void audio.play();
      } else audio.pause();
    });
    (el.seek as HTMLInputElement).addEventListener('input', () => {
      if (!audio) return;
      audio.currentTime = Number((el.seek as HTMLInputElement).value);
      replay(audio.currentTime);
      render();
    });
    el.speed.addEventListener('click', () => {
      prefs.speed = SPEEDS[(SPEEDS.indexOf(prefs.speed) + 1) % SPEEDS.length];
      savePrefs();
      syncSpeed();
    });
    el.cc.addEventListener('click', () => {
      prefs.captions = !prefs.captions;
      el.cc.setAttribute('aria-pressed', String(prefs.captions));
      savePrefs();
      render();
    });
    el.guide.addEventListener('click', () => {
      prefs.guidance = !guided;
      savePrefs();
      setGuided(!guided);
    });
    q('.tour__resume').addEventListener('click', () => setGuided(true));
    q('.tour__close').addEventListener('click', close);
  };

  const open = async (from: HTMLElement): Promise<void> => {
    if (bar) {
      void audio?.play();
      return;
    }
    opener = from;
    const s = await load();
    if (!s) return;
    document.documentElement.setAttribute('data-tour', '');
    build(s);
    audio = new Audio(`/audio/${lang}/${s.file}`);
    audio.preload = 'auto';
    audio.playbackRate = prefs.speed;
    for (const ev of ['play', 'pause', 'ended']) audio.addEventListener(ev, setPlaying);
    audio.addEventListener('error', () => {
      el.caption.textContent = t.unavailable;
    });
    lastCue = -1;
    addEventListener('keydown', onKey);
    addEventListener('wheel', onHand, { passive: true });
    addEventListener('touchstart', onHand, { passive: true });
    try {
      await audio.play();
    } catch {
      /* the browser refused: the bar stays open on "Play" */
    }
    el.play.focus();
    setPlaying();
  };

  for (const starter of starters) starter.addEventListener('click', () => void open(starter));
}
