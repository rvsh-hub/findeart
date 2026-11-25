import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchWorks, type Work } from '@/data/catalog';
import { Ink, Type } from '@/identity/grand-tour';
import { Stamp } from '@/identity/stamp';
import { recognize, type Recognition } from '@/recognition';
import { useCollection } from '@/state/collection';

/** After the shot: recognise the work, or offer the few works nearby. */
export default function RecognizeScreen() {
  const { uri, city } = useLocalSearchParams<{ uri: string; city?: string }>();
  const { addCapture, byWork } = useCollection();
  const [result, setResult] = useState<Recognition | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    recognize(uri, city || null).then(setResult);
  }, [uri, city]);

  const unlock = (w: Work) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addCapture({ workId: w.id, photoUri: uri, note: '', city: city || null });
    router.replace({ pathname: '/timbro/[id]', params: { id: w.id, nuovo: '1' } });
  };

  useEffect(() => {
    if (result?.confident && result.candidates[0]) unlock(result.candidates[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const list = useMemo(() => {
    if (query.trim()) return searchWorks(query, 30);
    const c = result?.candidates ?? [];
    return [...c].sort((a, b) => Number(byWork.has(a.id)) - Number(byWork.has(b.id)));
  }, [query, result, byWork]);

  const heading = !result
    ? 'Sto guardando…'
    : result.candidates.length && !query
      ? `Sei a ${result.city}. Quale di queste?`
      : 'Non so ancora dove sei. Cerca l’opera';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Nuova scoperta</Text>
          <Text style={styles.title}>{heading}</Text>
        </View>
        <Pressable onPress={() => router.back()} accessibilityLabel="Chiudi" style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Cerca per titolo, artista o museo"
        placeholderTextColor={Ink.inkFaint}
        style={styles.search}
      />

      {!result ? (
        <ActivityIndicator color={Ink.stamp} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(w) => w.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 10 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query ? 'Nessuna opera trovata.' : 'Scrivi qui sopra il titolo o il museo.'}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable style={{ flex: 1 / 3 }} onPress={() => unlock(item)} accessibilityLabel={item.title}>
              <Stamp work={item} owned photoUri={byWork.get(item.id)?.photoUri} />
              {byWork.has(item.id) && <Text style={styles.owned}>già nel taccuino</Text>}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Ink.paper },
  head: { flexDirection: 'row', gap: 14, padding: 16, alignItems: 'center' },
  thumb: { width: 64, height: 80, borderRadius: 2, borderWidth: 3, borderColor: '#FBF6EC' },
  kicker: { fontFamily: Type.label, fontSize: 10, letterSpacing: 1.5, color: Ink.stamp, textTransform: 'uppercase' },
  title: { fontFamily: Type.display, fontSize: 20, lineHeight: 25, color: Ink.ink, marginTop: 2 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 18, color: Ink.inkSoft },
  search: { marginHorizontal: 16, borderBottomWidth: 1, borderColor: Ink.paperEdge, paddingVertical: 10, fontFamily: Type.body, fontSize: 16, color: Ink.ink },
  grid: { padding: 16, gap: 12 },
  empty: { fontFamily: Type.displayItalic, fontStyle: 'italic', color: Ink.inkSoft, textAlign: 'center', marginTop: 32 },
  owned: { fontFamily: Type.label, fontSize: 8, color: Ink.inkFaint, textAlign: 'center', marginTop: 3 },
});
