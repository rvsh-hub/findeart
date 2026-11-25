import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ARTISTS, type Work } from '@/data/catalog';
import { Ink, Type } from '@/identity/grand-tour';
import { Stamp } from '@/identity/stamp';
import { useCollection } from '@/state/collection';

const chunk = <T,>(xs: T[], n: number) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

/** The notebook: one page per artist, stamps collected and still missing. */
export default function NotebookScreen() {
  const { byWork, points } = useCollection();
  const [artistId, setArtistId] = useState(ARTISTS.find((a) => a.id === 'caravaggio')?.id ?? ARTISTS[0].id);
  const artist = ARTISTS.find((a) => a.id === artistId)!;

  const sections = useMemo(() => {
    const main = artist.works.filter((w) => w.counts === 'yes');
    const maybe = artist.works.filter((w) => w.counts === 'maybe');
    const bonus = artist.works.filter((w) => w.counts === 'no');
    return [
      { title: 'Le opere', data: chunk(main, 3) },
      { title: 'Attribuzione discussa', data: chunk(maybe, 3) },
      { title: 'Timbri speciali', data: chunk(bonus, 3) },
    ].filter((s) => s.data.length);
  }, [artist]);

  const found = artist.works.filter((w) => w.counts === 'yes' && byWork.has(w.id)).length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Indietro" style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.h1}>Il mio taccuino</Text>
        <Text style={styles.points}>{points.toLocaleString('it-IT')} pt</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} style={{ flexGrow: 0 }}>
        {ARTISTS.map((a) => {
          const on = a.id === artistId;
          return (
            <Pressable key={a.id} onPress={() => setArtistId(a.id)} style={[styles.tab, on && styles.tabOn]}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{a.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {found} di {artist.total} opere
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(found / Math.max(1, artist.total)) * 100}%` }]} />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(row) => row.map((w) => w.id).join('-')}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((w: Work) => (
              <Pressable
                key={w.id}
                style={styles.cell}
                onPress={() => router.push({ pathname: '/timbro/[id]', params: { id: w.id } })}>
                <Stamp work={w} owned={byWork.has(w.id)} photoUri={byWork.get(w.id)?.photoUri} />
              </Pressable>
            ))}
            {Array.from({ length: 3 - row.length }).map((_, i) => (
              <View key={i} style={styles.cell} />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Ink.paper },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 4 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 32, color: Ink.ink, lineHeight: 36 },
  h1: { flex: 1, fontFamily: Type.display, fontSize: 28, color: Ink.ink },
  points: { fontFamily: Type.label, fontSize: 13, color: Ink.stamp, paddingRight: 8 },
  tabs: { paddingHorizontal: 16, gap: 6, paddingVertical: 12 },
  tab: { paddingHorizontal: 12, height: 36, justifyContent: 'center', borderWidth: 1, borderColor: Ink.paperEdge, borderRadius: 2 },
  tabOn: { backgroundColor: Ink.ink, borderColor: Ink.ink },
  tabText: { fontFamily: Type.body, fontSize: 14, color: Ink.ink },
  tabTextOn: { color: Ink.paper },
  progressRow: { paddingHorizontal: 16, gap: 6 },
  progressText: { fontFamily: Type.displayItalic, fontStyle: 'italic', fontSize: 14, color: Ink.inkSoft },
  track: { height: 3, backgroundColor: Ink.paperEdge },
  fill: { height: 3, backgroundColor: Ink.stamp },
  list: { padding: 16, paddingBottom: 48 },
  section: { fontFamily: Type.label, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: Ink.sepia, marginTop: 12, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  cell: { flex: 1 },
});
