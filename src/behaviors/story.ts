import { cablePath } from '../render/runner';

// The hero story: scroll progress (0 to 1) drives how far the runner comes apart and how far it has turned.
//   wide screens  : the hero is pinned for a few screens of scrolling (CSS), progress follows the scroll;
//   small screens : no pin, progress follows the runner crossing the viewport;
//   reduced motion: nothing moves by itself, the three steps are buttons that set the runner's state.
const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Each step owns a third of the scroll. */
const STAGES: ReadonlyArray<readonly [number, number]> = [
  [0, 0.34],
  [0.34, 0.68],
  [0.68, 1],
];
// comes apart, then goes back together for the last step (fully assembled at the end, so the lamp can light)
const explosion = (p: number): number => (0.06 + 0.94 * smooth(0.2, 0.52, p)) * (1 - smooth(0.72, 0.94, p));
/** The state a step shows when it is picked by hand (reduced motion). */
const MANUAL = [0.08, 1, 0.1];

export interface Story {
  /** Brings the hero to step `i` (0, 1 or 2): scrolls to it, or sets it by hand with reduced motion. */
  goStep(i: number, smooth?: boolean): void;
}

export function initStory(hero: HTMLElement): Story | null {
  const runner = hero.querySelector<HTMLElement>('[data-runner]');
  const pin = hero.querySelector<HTMLElement>('.hero__pin');
  const figure = hero.querySelector<HTMLElement>('.hero__figure');
  const steps = [...hero.querySelectorAll<HTMLElement>('.step')];
  const wires = [...hero.querySelectorAll<SVGPathElement>('.rn-cable, .rn-sparks')];
  if (!runner || !pin || !figure) return null;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 960px) and (min-height: 620px)');
  const headerH = (): number =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;

  let e = 0.55;
  let p = 0.3;
  let targetE = e;
  let targetP = p;
  let frame = 0;

  const paint = (): void => {
    runner.style.setProperty('--e', e.toFixed(4));
    runner.style.setProperty('--p', p.toFixed(4));
    // the generator rides on the shaft, so the cable to the lamp follows it
    const wire = cablePath(e);
    wires.forEach((w) => w.setAttribute('d', wire));
    const stage = STAGES.findIndex(([, b]) => targetP < b);
    const active = stage === -1 ? 2 : stage;
    hero.dataset.stage = String(active + 1);
    steps.forEach((s, i) => {
      const [a, b] = STAGES[i];
      s.toggleAttribute('data-active', i === active);
      s.style.setProperty('--fill', clamp((targetP - a) / (b - a)).toFixed(3));
    });
  };

  const tick = (): void => {
    frame = 0;
    e += (targetE - e) * 0.16;
    p += (targetP - p) * 0.16;
    paint();
    if (Math.abs(targetE - e) > 0.0008 || Math.abs(targetP - p) > 0.0008) frame = requestAnimationFrame(tick);
  };
  const aim = (nextE: number, nextP: number): void => {
    targetE = nextE;
    targetP = nextP;
    if (!frame) frame = requestAnimationFrame(tick);
  };

  /** Progress for the current scroll position. */
  const progress = (): number => {
    const vh = innerHeight;
    if (wide.matches) {
      const r = hero.getBoundingClientRect();
      const run = r.height - pin.offsetHeight;
      return run > 0 ? clamp((headerH() - r.top) / run) : 0;
    }
    const r = figure.getBoundingClientRect();
    return clamp((vh * 0.9 - r.top) / (vh * 0.9 + r.height * 0.3 - 40));
  };
  /** Scroll offset that puts the progress at `want` (the inverse of `progress`). */
  const scrollFor = (want: number): number => {
    const vh = innerHeight;
    if (wide.matches) {
      const r = hero.getBoundingClientRect();
      return scrollY + r.top - headerH() + want * (r.height - pin.offsetHeight);
    }
    const r = figure.getBoundingClientRect();
    return scrollY + r.top - (vh * 0.9 - want * (vh * 0.9 + r.height * 0.3 - 40));
  };

  const onScroll = (): void => {
    const next = progress();
    aim(explosion(next), next);
  };

  let manual = -1;
  const goStep = (i: number, smooth = true): void => {
    if (reduce.matches) {
      manual = i;
      aim(MANUAL[i], (STAGES[i][0] + STAGES[i][1]) / 2);
    } else {
      scrollTo({ top: scrollFor((STAGES[i][0] + STAGES[i][1]) / 2), behavior: smooth ? 'smooth' : 'auto' });
    }
  };
  steps.forEach((s, i) => s.querySelector('button')?.addEventListener('click', () => goStep(i)));

  const setup = (): void => {
    if (reduce.matches) {
      // still: the runner comes apart a little, and the steps are driven by hand
      aim(
        MANUAL[manual < 0 ? 0 : manual],
        (STAGES[manual < 0 ? 0 : manual][0] + STAGES[manual < 0 ? 0 : manual][1]) / 2,
      );
      if (manual < 0) aim(0.55, 0.17);
    } else {
      onScroll();
      e = targetE;
      p = targetP;
      paint();
    }
  };
  addEventListener('scroll', () => !reduce.matches && onScroll(), { passive: true });
  addEventListener('resize', () => !reduce.matches && onScroll());
  reduce.addEventListener('change', setup);
  setup();
  return { goStep };
}
