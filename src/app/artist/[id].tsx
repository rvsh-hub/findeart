import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, SectionList, StyleSheet, View } from 'react-native';

import { ProgressBar, WorkTile } from '@/components/findeart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ARTISTS, RARITY, type Work } from '@/data/catalog';
import { useCollection } from '@/state/collection';

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byWork } = useCollection();
  const artist = ARTISTS.find((a) => a.id === id);

  if (!artist) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Artista non trovato.</ThemedText>
      </ThemedView>
    );
  }

  const owned = artist.works.filter((w) => w.counts === 'yes' && byWork.has(w.id)).length;
  const groups: { title: string; works: Work[] }[] = [
    { title: `Collezione (${owned}/${artist.total})`, works: artist.works.filter((w) => w.counts === 'yes') },
    { title: 'Attribuzione discussa', works: artist.works.filter((w) => w.counts === 'maybe') },
    { title: 'Carte bonus', works: artist.works.filter((w) => w.counts === 'no') },
  ].filter((g) => g.works.length > 0);

  const sections = groups.map((g) => ({ title: g.title, data: chunk(g.works, 2) }));

  const showWork = (w: Work) => {
    const c = byWork.get(w.id);
    Alert.alert(
      w.title,
      [
        w.year ? String(w.year) : null,
        `${w.place}${w.city ? `, ${w.city}` : ''}`,
        `${RARITY[w.rarity].label} · ${w.points} punti`,
        w.note || null,
        c ? `Catturata il ${new Date(c.capturedAt).toLocaleDateString('it-IT')}` : 'Non ancora catturata',
      ]
        .filter(Boolean)
        .join('\n\n'),
      c
        ? [{ text: 'Chiudi' }]
        : [
            { text: 'Chiudi', style: 'cancel' },
            { text: 'Catturala', onPress: () => router.navigate({ pathname: '/capture', params: { workId: w.id } }) },
          ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: artist.name }} />
      <SectionList
        sections={sections}
        keyExtractor={(row) => row.map((w) => w.id).join('|')}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <ProgressBar value={owned} max={artist.total} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((w) => (
              <WorkTile key={w.id} work={w} capture={byWork.get(w.id)} onPress={() => showWork(w)} />
            ))}
            {item.length === 1 && <View style={styles.spacer} />}
          </View>
        )}
        stickySectionHeadersEnabled={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.two, paddingBottom: Spacing.six },
  header: { padding: Spacing.two },
  sectionTitle: { paddingHorizontal: Spacing.two, paddingTop: Spacing.three, paddingBottom: Spacing.one },
  row: { flexDirection: 'row' },
  spacer: { flex: 1, margin: 4 },
});
