// Small inline icons (stroke = currentColor), decorative: every one sits next to a text or an aria-label.
const svg = (body: string, extra = '') =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;

export const ICONS = {
  sun: svg(
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    ' class="i-sun"',
  ),
  moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>', ' class="i-moon"'),
  menu: svg('<path d="M4 8h16M4 16h16"/>', ' class="i-menu"'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>', ' class="i-close"'),
  speaker: svg(
    '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  ),
  github: svg(
    '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  ),
  arrowUp: svg('<path d="M12 19V5M5 12l7-7 7 7"/>'),
};

/** The brand mark: a runner seen from the front, twelve buckets around a hub. */
export function markSvg(): string {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 12;
    const [s, c] = [Math.sin(a), Math.cos(a)];
    return `M${(16 + s * 9).toFixed(2)} ${(16 - c * 9).toFixed(2)}L${(16 + s * 14).toFixed(2)} ${(16 - c * 14).toFixed(2)}`;
  }).join('');
  return `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="${ticks}" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="16" r="2.6" fill="var(--copper)"/></svg>`;
}
