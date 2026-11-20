import { Image } from 'expo-image';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RarityBadge } from '@/components/findeart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { WORK_BY_ID } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { useCollection } from '@/state/collection';

export default function DiaryScreen() {
  const theme = useTheme();
  const { captures, removeCapture } = useCollection();

  const confirmRemove = (workId: string, title: string) =>
    Alert.alert('Togliere la carta?', title, [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Togli', style: 'destructive', onPress: () => removeCapture(workId) },
    ]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <FlatList
          data={captures}
          keyExtractor={(c) => c.workId}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<ThemedText type="subtitle">Diario</ThemedText>}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary">
              Ancora nessuna opera. Vai su Cattura alla prossima visita.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const w = WORK_BY_ID.get(item.workId);
            if (!w) return null;
            return (
              <Pressable
                onLongPress={() => confirmRemove(w.id, w.title)}
                style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                {item.photoUri ? (
                  <Image source={{ uri: item.photoUri }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]} />
                )}
                <View style={styles.flex}>
                  <ThemedText type="smallBold">{w.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {w.artist} · {w.city || w.place}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {new Date(item.capturedAt).toLocaleDateString('it-IT')}
                  </ThemedText>
                  {item.note ? <ThemedText type="small">{item.note}</ThemedText> : null}
                  <RarityBadge rarity={w.rarity} />
                </View>
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
  row: { flexDirection: 'row', gap: Spacing.three, padding: Spacing.two, borderRadius: 12 },
  thumb: { width: 72, height: 72, borderRadius: 8 },
});
