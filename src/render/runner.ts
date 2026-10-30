import type { Dict } from '../i18n';
import { esc } from './html';

const BUCKETS = 26;

/**
 * A Pelton runner drawn as a technical diagram, seen at an angle: the wheel is a flattened disc (so it can spin and
 * its buckets can fan out radially), the hub and the shaft lift off along the axis. The page drives it with two CSS
 * variables set on the wrapper: `--e` (how exploded, 0 to 1) and `--p` (scroll progress, which also turns the wheel).
 */
export function runnerSvg(t: Dict['hero']['drawing']): string {
  const buckets = Array.from({ length: BUCKETS }, (_, i) => {
    const a = ((360 / BUCKETS) * i).toFixed(3);
    return `<g class="rn-bucket" style="--a:${a}deg;--i:${i}"><use href="#rn-petal"/></g>`;
  }).join('');
  const holes = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 8;
    return `<circle cx="${(Math.sin(a) * 98).toFixed(1)}" cy="${(-Math.cos(a) * 98).toFixed(1)}" r="17"/>`;
  }).join('');

  return `<svg class="rn" viewBox="-320 -250 640 410" role="presentation" focusable="false">
  <defs>
    <g id="rn-petal">
      <path class="rn-petal-body" d="M0-150C17-163 19-196 0-210C-19-196-17-163 0-150Z"/>
      <path class="rn-petal-split" d="M0-157L0-203"/>
    </g>
    <marker id="rn-tick" viewBox="0 0 6 10" refX="3" refY="5" markerWidth="6" markerHeight="10" orient="auto">
      <path d="M3 0V10" fill="none" stroke="currentColor" stroke-width="1.4"/>
    </marker>
  </defs>
  <g>
    <!-- the wheel, flattened -->
    <g class="rn-edge">
      <path d="M-148 0V16M148 0V16"/>
      <path d="M-148 16A148 62.2 0 0 0 148 16"/>
    </g>
    <g transform="scale(1 .42)">
      <g class="rn-idle"><g class="rn-turn">
        <circle class="rn-web" r="148"/>
        <circle class="rn-line" r="132"/>
        <circle class="rn-line" r="62"/>
        <g class="rn-holes">${holes}</g>
        ${buckets}
      </g></g>
    </g>

    <!-- the jet -->
    <g class="rn-jet">
      <path class="rn-nozzle" d="M292 60L328 51L328 85L292 77Z"/>
      <path class="rn-stream" d="M290 68C256 63 220 52 190 38"/>
      <text class="rn-note-text" x="296" y="108">${esc(t.jet)}</text>
    </g>

    <!-- the hub and the shaft lift off along the axis -->
    <g class="rn-shaft">
      <path class="rn-rod" d="M0 -78V82"/>
      <ellipse class="rn-cap" cx="0" cy="-78" rx="12" ry="5"/>
      <ellipse class="rn-cap" cx="0" cy="82" rx="12" ry="5"/>
      <g class="rn-note">
        <path class="rn-leader" d="M14 -70L84 -112H152"/>
        <text class="rn-note-text" x="158" y="-108">${esc(t.shaft)}</text>
      </g>
    </g>
    <g class="rn-hub">
      <ellipse class="rn-hub-body" cx="0" cy="0" rx="58" ry="25"/>
      <ellipse class="rn-line" cx="0" cy="0" rx="30" ry="13"/>
      <g class="rn-note">
        <path class="rn-leader" d="M-50 -10L-120 -52H-188"/>
        <text class="rn-note-text rn-note-text--end" x="-194" y="-48">${esc(t.hub)}</text>
      </g>
    </g>

    <!-- notes -->
    <g class="rn-note rn-note--buckets">
      <path class="rn-leader" d="M146 -80L190 -138H214"/>
      <text class="rn-note-text" x="220" y="-134">${esc(t.buckets)}</text>
    </g>
    <g class="rn-dim">
      <path class="rn-dim-line" d="M-206 142H206" marker-start="url(#rn-tick)" marker-end="url(#rn-tick)"/>
      <text class="rn-dim-text" x="0" y="132" text-anchor="middle">${esc(t.diameter)}</text>
    </g>
  </g>
</svg>`;
}
