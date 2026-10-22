import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';
import { url } from './url';

export type Piece = CollectionEntry<'pieces'>;

export async function getPieces(): Promise<Piece[]> {
  const all = await getCollection('pieces', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const pieceUrl = (p: Piece) => url(`/writing/${p.id}/`);

export const tagSlug = (t: string) =>
  t.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const tagUrl = (t: string) => url(`/topics/${tagSlug(t)}/`);

export function minutes(p: Piece) {
  // Data blocks (charts/tables) are not prose; leave them out of the estimate.
  const prose = (p.body ?? '').replace(/```[\s\S]*?```/g, '');
  return Math.max(1, Math.round(readingTime(prose).minutes));
}

export function words(p: Piece) {
  const prose = (p.body ?? '').replace(/```[\s\S]*?```/g, '');
  return readingTime(prose).words;
}

const long = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmtDate = (d: Date) => long.format(d);
export const fmtShort = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;

export function allTags(pieces: Piece[]) {
  const counts = new Map<string, number>();
  for (const p of pieces) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const hasModel = (p: Piece) => Boolean(p.data.model_file);

export const fileName = (path: string) => decodeURIComponent(path.split('/').pop() ?? path);
