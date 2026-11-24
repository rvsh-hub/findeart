import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { RARITY, type Rarity, type Work } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import type { Capture } from '@/state/collection';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const r = RARITY[rarity];
  return (
    <View style={[styles.badge, { borderColor: r.color }]}>
      <ThemedText style={[styles.badgeText, { color: r.color }]}>
        {r.label} · {r.points}
      </ThemedText>
    </View>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const theme = useTheme();
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: theme.text }]} />
    </View>
  );
}

/** A card in the Pokédex grid: full colour when captured, greyed out when missing. */
export function WorkTile({ work, capture, onPress }: { work: Work; capture?: Capture; onPress?: () => void }) {
  const theme = useTheme();
  const owned = !!capture;
  const color = RARITY[work.rarity].color;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        { backgroundColor: theme.backgroundElement, borderColor: owned ? color : 'transparent' },
        !owned && styles.missing,
      ]}>
      {owned && capture?.photoUri ? (
        <Image source={{ uri: capture.photoUri }} style={styles.photo} contentFit="cover" />
      ) : (
        <View style={[styles.photo, styles.placeholder, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.qmark} themeColor="textSecondary">
            {owned ? '✓' : '?'}
          </ThemedText>
        </View>
      )}
      <ThemedText type="smallBold" numberOfLines={2}>
        {work.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {work.city || work.place}
      </ThemedText>
      <RarityBadge rarity={work.rarity} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, marginTop: 4 },
  badgeText: { fontSize: 11, lineHeight: 16, fontWeight: 700 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  tile: { flex: 1, margin: 4, padding: 8, borderRadius: 12, borderWidth: 2, gap: 2 },
  missing: { opacity: 0.45 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 4 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  qmark: { fontSize: 32, lineHeight: 40 },
});
