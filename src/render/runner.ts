import type { Dict } from '../i18n';
import { esc } from './html';

const BUCKETS = 26;

/** Where the cable leaves the generator (which rides on the shaft) and reaches the lamp, for an explosion of `e`. */
export function cablePath(e: number): string {
  const y = (-49 - 150 * e).toFixed(1);
  return `M30 ${y}C110 ${y} 150 -150 236 -172`;
}

/**
 * A Pelton runner drawn as a technical diagram, seen at an angle: the wheel is a flattened disc (so it can spin and
 * its buckets can fan out radially), the hub and the shaft lift off along the axis, and the shaft carries a generator
 * that lights a lamp once the wheel runs. The page drives it with two CSS variables set on the wrapper: `--e` (how
 * exploded, 0 to 1) and `--p` (scroll progress, which also turns the wheel), and with `data-stage` on the hero.
 *
 * Depth, bottom to top: the part of the shaft under the wheel's plane (hidden by the wheel), the wheel, the hub, the
 * part of the shaft above the plane (so the shaft passes through the wheel and comes out of the hub), the lamp.
 */
export function runnerSvg(t: Dict['hero']['drawing'], e = 0.55): string {
  const buckets = Array.from({ length: BUCKETS }, (_, i) => {
    const a = ((360 / BUCKETS) * i).toFixed(3);
    return `<g class="rn-bucket" style="--a:${a}deg;--i:${i}"><use href="#rn-petal"/></g>`;
  }).join('');
  const holes = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 8;
    return `<circle cx="${(Math.sin(a) * 98).toFixed(1)}" cy="${(-Math.cos(a) * 98).toFixed(1)}" r="17"/>`;
  }).join('');
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 8 + Math.PI / 8;
    const [s, c] = [Math.sin(a), Math.cos(a)];
    return `M${(s * 27).toFixed(1)} ${(-c * 27).toFixed(1)}L${(s * 37).toFixed(1)} ${(-c * 37).toFixed(1)}`;
  }).join('');
  const rod = (y1: number, y2: number): string => `<path class="rn-rod" d="M0 ${y1}V${y2}"/>`;
  const cable = cablePath(e);

  return `<svg class="rn" viewBox="-320 -255 640 415" role="presentation" focusable="false">
  <defs>
    <g id="rn-petal">
      <path class="rn-petal-body" d="M0-150C17-163 19-196 0-210C-19-196-17-163 0-150Z"/>
      <path class="rn-petal-split" d="M0-157L0-203"/>
    </g>
    <marker id="rn-tick" viewBox="0 0 6 10" refX="3" refY="5" markerWidth="6" markerHeight="10" orient="auto">
      <path d="M3 0V10" fill="none" stroke="currentColor" stroke-width="1.4"/>
    </marker>
    <clipPath id="rn-below"><rect x="-400" y="0" width="800" height="400"/></clipPath>
    <clipPath id="rn-above"><rect x="-400" y="-400" width="800" height="400"/></clipPath>
  </defs>

  <!-- the shaft below the wheel's plane: the wheel hides it -->
  <g clip-path="url(#rn-below)"><g class="rn-shaft">${rod(60, -90)}</g></g>

  <!-- the wheel, flattened -->
  <g class="rn-edge">
    <path class="rn-wall" d="M-148 0V16A148 62.2 0 0 0 148 16V0Z"/>
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

  <!-- the hub lifts off first -->
  <g class="rn-hub">
    <path class="rn-hub-wall" d="M-58 0V13A58 25 0 0 0 58 13V0"/>
    <ellipse class="rn-hub-body" cx="0" cy="0" rx="58" ry="25"/>
    <ellipse class="rn-line" cx="0" cy="0" rx="30" ry="13"/>
    <ellipse class="rn-bore" cx="0" cy="0" rx="11" ry="5"/>
    <g class="rn-note">
      <path class="rn-leader" d="M-52 6L-100 38H-150"/>
      <text class="rn-note-text rn-note-text--end" x="-156" y="42">${esc(t.hub)}</text>
    </g>
  </g>

  <!-- the shaft above the plane: it goes through the wheel and out of the hub, and carries the generator -->
  <g clip-path="url(#rn-above)"><g class="rn-shaft">
    ${rod(60, -90)}
    <g class="rn-gen">
      <path class="rn-gen-body" d="M-30 -62V-36A30 12 0 0 0 30 -36V-62"/>
      <ellipse class="rn-gen-top" cx="0" cy="-62" rx="30" ry="12"/>
      <path class="rn-gen-coil" d="M-30 -49A30 12 0 0 0 30 -49"/>
      <path class="rn-gen-coil" d="M-30 -42A30 12 0 0 0 30 -42"/>
    </g>
    ${rod(-62, -90)}
    <ellipse class="rn-cap" cx="0" cy="-90" rx="12" ry="5"/>
    <g class="rn-note">
      <path class="rn-leader" d="M-6 20L-60 40H-110"/>
      <text class="rn-note-text rn-note-text--end" x="-116" y="44">${esc(t.shaft)}</text>
    </g>
    <g class="rn-note">
      <path class="rn-leader" d="M-30 -50L-76 -78H-120"/>
      <text class="rn-note-text rn-note-text--end" x="-126" y="-74">${esc(t.generator)}</text>
    </g>
  </g></g>

  <!-- electricity: a cable from the generator to a lamp that lights when the wheel runs -->
  <g class="rn-power">
    <path class="rn-cable" d="${cable}"/>
    <path class="rn-sparks" d="${cable}"/>
    <g transform="translate(236 -196)">
      <g class="rn-glow"><circle r="34"/><path d="${rays}"/></g>
      <circle class="rn-bulb" r="17"/>
      <path class="rn-filament" d="M-6 7V0L-3 -7L0 0L3 -7L6 0V7"/>
      <path class="rn-socket" d="M-8 17H8M-6 21H6"/>
      <text class="rn-note-text rn-power-text" x="0" y="-46" text-anchor="middle">${esc(t.power)}</text>
    </g>
  </g>

  <!-- notes -->
  <g class="rn-note rn-note--buckets">
    <path class="rn-leader" d="M176 -64L192 -118H202"/>
    <text class="rn-note-text" x="208" y="-114">${esc(t.buckets)}</text>
  </g>
  <g class="rn-dim">
    <path class="rn-dim-line" d="M-206 142H206" marker-start="url(#rn-tick)" marker-end="url(#rn-tick)"/>
    <text class="rn-dim-text" x="0" y="132" text-anchor="middle">${esc(t.diameter)}</text>
  </g>
</svg>`;
}
