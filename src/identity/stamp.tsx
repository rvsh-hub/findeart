import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { Work } from '@/data/catalog';
import { Ink, RarityInk, Type } from '@/identity/grand-tour';

/**
 * A work as a postage stamp: perforated edge, rarity ink, photo inside.
 * Missing works are drawn as an empty, dashed stamp to be collected.
 */
export function Stamp({
  work,
  photoUri,
  owned,
  size = 'small',
  style,
}: {
  work: Work;
  photoUri?: string | null;
  owned: boolean;
  size?: 'small' | 'large';
  style?: ViewStyle;
}) {
  const r = RarityInk[work.rarity];
  const big = size === 'large';
  return (
    <View style={[styles.perf, big && styles.perfBig, style]}>
      <View style={[styles.inner, { borderColor: owned ? r.color : Ink.paperEdge }, !owned && styles.missing]}>
        <View style={[styles.art, big && styles.artBig, { backgroundColor: owned ? Ink.paperDeep : 'transparent' }]}>
          {owned && photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={[styles.unknown, { color: owned ? r.color : Ink.paperEdge }]}>{owned ? '✦' : '?'}</Text>
          )}
        </View>
        <Text style={[styles.rarity, big && styles.rarityBig, { color: owned ? r.color : Ink.inkFaint }]}>
          {owned ? `${r.label} · ${r.points}` : r.label}
        </Text>
        <Text numberOfLines={big ? 3 : 2} style={[styles.title, big && styles.titleBig, !owned && { color: Ink.inkFaint }]}>
          {owned || big ? work.title : 'Da scoprire'}
        </Text>
        {big && (
          <Text style={styles.meta}>
            {work.artist}
            {work.year ? ` · ${work.year}` : ''}
            {'\n'}
            {work.place}
            {work.city ? `, ${work.city}` : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

/** A round cancellation mark, like a postmark over the stamp. */
export function Postmark({ city, date, color = Ink.stamp }: { city: string; date: string; color?: string }) {
  return (
    <View style={[styles.postmark, { borderColor: color }]}>
      <Text style={[styles.postmarkText, { color }]} numberOfLines={1}>
        {city.toUpperCase()}
      </Text>
      <View style={[styles.postmarkRule, { backgroundColor: color }]} />
      <Text style={[styles.postmarkText, { color }]}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  perf: {
    padding: 5,
    backgroundColor: '#FBF6EC',
    borderRadius: 3,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: Ink.paperEdge,
  },
  perfBig: { padding: 10, borderWidth: 3 },
  inner: { borderWidth: 2, padding: 6, gap: 3 },
  missing: { borderStyle: 'dashed' },
  art: { aspectRatio: 0.82, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artBig: { aspectRatio: 0.8 },
  unknown: { fontFamily: Type.display, fontSize: 28 },
  rarity: { fontFamily: Type.label, fontSize: 8, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2 },
  rarityBig: { fontSize: 11 },
  title: { fontFamily: Type.display, fontSize: 11, lineHeight: 13, color: Ink.ink, minHeight: 26 },
  titleBig: { fontSize: 24, lineHeight: 28, minHeight: 0 },
  meta: { fontFamily: Type.body, fontSize: 13, lineHeight: 19, color: Ink.inkSoft, marginTop: 4 },
  postmark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    transform: [{ rotate: '-14deg' }],
    opacity: 0.85,
  },
  postmarkText: { fontFamily: Type.label, fontSize: 9, letterSpacing: 1 },
  postmarkRule: { height: 1.5, alignSelf: 'stretch', marginVertical: 4 },
});
