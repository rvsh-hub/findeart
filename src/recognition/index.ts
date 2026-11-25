import { WORKS, type Work } from '@/data/catalog';

export type Coords = { latitude: number; longitude: number };

export type Recognition = {
  /** Where the user is, as a city name, when the location is known. */
  city: string | null;
  /** Best matches first. A single confident match is unlocked directly. */
  candidates: Work[];
  /** True when the app is sure enough to unlock the card without asking. */
  confident: boolean;
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Recognise the work in a photo.
 *
 * Step 1 (today): the location narrows the catalogue to the works in the
 * user's city, so the choice is among a few cards instead of a search.
 * Step 2 (next): the photo and these candidates go to an online vision
 * model, which picks the work; `confident` then becomes true and the card
 * unlocks with no tap at all.
 */
export async function recognize(_photoUri: string, city: string | null): Promise<Recognition> {
  if (!city) return { city: null, candidates: [], confident: false };
  const c = norm(city);
  const candidates = WORKS.filter((w) => {
    const wc = norm(w.city);
    return wc && (wc === c || wc.includes(c) || c.includes(wc));
  });
  return { city, candidates, confident: false };
}
