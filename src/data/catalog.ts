import raw from './catalog.json';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'ghost';

export type Work = {
  id: string;
  artist: string;
  artistId: string;
  title: string;
  year: number | null;
  type: string;
  place: string;
  city: string;
  status: string;
  /** yes = counts toward the artist total, maybe = disputed attribution, no = bonus card */
  counts: 'yes' | 'maybe' | 'no';
  rarity: Rarity;
  points: number;
  note: string;
};

export const WORKS = raw as Work[];

export const RARITY: Record<Rarity, { label: string; color: string; points: number }> = {
  common: { label: 'Comune', color: '#8A8F98', points: 10 },
  uncommon: { label: 'Non comune', color: '#2F9E44', points: 25 },
  rare: { label: 'Rara', color: '#1C7ED6', points: 50 },
  legendary: { label: 'Leggendaria', color: '#AE3EC9', points: 100 },
  ghost: { label: 'Fantasma', color: '#E8590C', points: 200 },
};

export type Artist = { id: string; name: string; works: Work[]; total: number };

export const ARTISTS: Artist[] = Object.values(
  WORKS.reduce<Record<string, Artist>>((acc, w) => {
    const a = (acc[w.artistId] ??= { id: w.artistId, name: w.artist, works: [], total: 0 });
    a.works.push(w);
    if (w.counts === 'yes') a.total += 1;
    return acc;
  }, {}),
).sort((a, b) => a.name.localeCompare(b.name, 'it'));

export const WORK_BY_ID = new Map(WORKS.map((w) => [w.id, w]));

/** Case- and accent-insensitive search on title, artist, place and city. */
export function searchWorks(query: string, limit = 30): Work[] {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return WORKS.filter((w) => {
    const hay = norm(`${w.title} ${w.artist} ${w.place} ${w.city}`);
    return terms.every((t) => hay.includes(t));
  }).slice(0, limit);
}
