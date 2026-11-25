import { Platform } from 'react-native';

import type { Rarity } from '@/data/catalog';

/**
 * FindeArt visual identity: "Taccuino del Grand Tour".
 * Paper, ink and stamps. Every colour and font of the app lives here,
 * so the identity can evolve step by step without touching the screens.
 */
export const Ink = {
  paper: '#F3EBDD',
  paperDeep: '#E8DCC6',
  paperEdge: '#D9C9AC',
  ink: '#2A221D',
  inkSoft: '#5C4F44',
  inkFaint: '#8C7D6E',
  sepia: '#7A5A3A',
  stamp: '#A23B2A',
  night: '#16110E',
} as const;

export const Type = {
  display: Platform.select({ ios: 'Georgia', default: 'serif' }),
  displayItalic: Platform.select({ ios: 'Georgia-Italic', default: 'serif' }),
  body: Platform.select({ ios: 'Georgia', default: 'serif' }),
  label: Platform.select({ ios: 'Menlo', default: 'monospace' }),
};

/** Rarity as postage-stamp inks. */
export const RarityInk: Record<Rarity, { label: string; color: string; points: number }> = {
  common: { label: 'Comune', color: '#6B6158', points: 10 },
  uncommon: { label: 'Non comune', color: '#4E7A5A', points: 25 },
  rare: { label: 'Rara', color: '#2F4E7A', points: 50 },
  legendary: { label: 'Leggendaria', color: '#B07A1E', points: 100 },
  ghost: { label: 'Fantasma', color: '#6E4C8A', points: 200 },
};
