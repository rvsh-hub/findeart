import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/findeart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { ARTISTS } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { useCollection } from '@/state/collection';

export default function PokedexScreen() {
  const { byWork, points, captures } = useCollection();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <FlatList
          data={ARTISTS}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="subtitle">FindeArt</ThemedText>
              <ThemedText themeColor="textSecondary">
                {captures.length} opere catturate · {points} punti
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => {
            const owned = item.works.filter((w) => w.counts === 'yes' && byWork.has(w.id)).length;
            const bonus = item.works.filter((w) => w.counts !== 'yes' && byWork.has(w.id)).length;
            return (
              <Pressable
                onPress={() => router.push({ pathname: '/artist/[id]', params: { id: item.id } })}
                style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.rowTop}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <ThemedText type="smallBold">
                    {owned}/{item.total}
                    {bonus > 0 ? ` +${bonus}` : ''}
                  </ThemedText>
                </View>
                <ProgressBar value={owned} max={item.total} />
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  list: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.two },
  header: { marginBottom: Spacing.three, gap: Spacing.one },
  row: { padding: Spacing.three, borderRadius: 12, gap: Spacing.two },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
});
