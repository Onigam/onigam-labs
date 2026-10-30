const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text for HTML content and attribute values. */
export function esc(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/** Drops falsy parts so conditional markup can be written as `cond && '<b>…</b>'`. */
export function join(parts: Array<string | false | null | undefined>, sep = ''): string {
  return parts.filter(Boolean).join(sep);
}
