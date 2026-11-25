import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WORK_BY_ID, type Rarity } from '@/data/catalog';
import { Ink, RarityInk, Type } from '@/identity/grand-tour';
import { Postmark } from '@/identity/stamp';
import { useCollection } from '@/state/collection';

/** The art passport: points, stamps by rarity and the cities visited. */
export default function PassportScreen() {
  const { captures, points } = useCollection();

  const byRarity = (Object.keys(RarityInk) as Rarity[]).map((r) => ({
    r,
    n: captures.filter((c) => WORK_BY_ID.get(c.workId)?.rarity === r).length,
  }));

  const cities = new Map<string, string>();
  for (const c of [...captures].reverse()) {
    const city = c.city || WORK_BY_ID.get(c.workId)?.city;
    if (city && !cities.has(city)) {
      cities.set(city, new Date(c.capturedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }));
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Indietro" style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.h1}>Passaporto</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.cover}>
          <Text style={styles.coverKicker}>FindeArt · Grand Tour d'Italia</Text>
          <Text style={styles.coverPoints}>{points.toLocaleString('it-IT')}</Text>
          <Text style={styles.coverLabel}>punti · {captures.length} timbri</Text>
        </View>

        <Text style={styles.section}>Timbri per rarità</Text>
        <View style={styles.rarities}>
          {byRarity.map(({ r, n }) => (
            <View key={r} style={styles.rarityRow}>
              <View style={[styles.dot, { backgroundColor: RarityInk[r].color }]} />
              <Text style={styles.rarityLabel}>{RarityInk[r].label}</Text>
              <Text style={styles.rarityN}>{n}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Città visitate</Text>
        {cities.size === 0 ? (
          <Text style={styles.empty}>Il tuo primo timbro di città arriverà con la prima cattura.</Text>
        ) : (
          <View style={styles.postmarks}>
            {[...cities].map(([city, date], i) => (
              <Postmark key={city} city={city} date={date} color={i % 2 ? Ink.sepia : Ink.stamp} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Ink.paper },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 4 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 32, color: Ink.ink, lineHeight: 36 },
  h1: { flex: 1, fontFamily: Type.display, fontSize: 28, color: Ink.ink },
  body: { padding: 16, paddingBottom: 48 },
  cover: { backgroundColor: '#5A1F1A', borderRadius: 6, padding: 24, alignItems: 'center' },
  coverKicker: { fontFamily: Type.label, fontSize: 10, letterSpacing: 1.5, color: '#E6C98F', textTransform: 'uppercase' },
  coverPoints: { fontFamily: Type.display, fontSize: 56, color: '#F3E3C0', marginTop: 8 },
  coverLabel: { fontFamily: Type.displayItalic, fontStyle: 'italic', fontSize: 15, color: '#E6C98F' },
  section: { fontFamily: Type.label, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: Ink.sepia, marginTop: 24, marginBottom: 10 },
  rarities: { gap: 8 },
  rarityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: Ink.paperEdge, paddingBottom: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rarityLabel: { flex: 1, fontFamily: Type.body, fontSize: 16, color: Ink.ink },
  rarityN: { fontFamily: Type.label, fontSize: 14, color: Ink.ink },
  empty: { fontFamily: Type.displayItalic, fontStyle: 'italic', color: Ink.inkSoft },
  postmarks: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});
