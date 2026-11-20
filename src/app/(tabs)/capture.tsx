import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RarityBadge } from '@/components/findeart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { searchWorks, WORK_BY_ID, type Work } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';
import { useCollection } from '@/state/collection';

/**
 * Capture flow: photo -> pick the work -> optional note -> save.
 * Recognition is manual for now (search the catalogue); automatic
 * recognition from the photo and the location check come next.
 */
export default function CaptureScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ workId?: string }>();
  const { addCapture, byWork } = useCollection();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Work | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const w = params.workId ? WORK_BY_ID.get(params.workId) : undefined;
    if (w) setSelected(w);
  }, [params.workId]);

  const pick = async (fromCamera: boolean) => {
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Fotocamera', 'Serve il permesso della fotocamera per scattare la foto.');
        return;
      }
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
    const res = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const reset = () => {
    setPhotoUri(null);
    setQuery('');
    setSelected(null);
    setNote('');
    router.setParams({ workId: undefined });
  };

  const save = () => {
    if (!selected) return;
    addCapture({ workId: selected.id, photoUri, note: note.trim() });
    const name = selected.artistId;
    const title = selected.title;
    reset();
    Alert.alert('Catturata!', `${title} è nel tuo Pokédex.`, [
      { text: 'OK' },
      { text: 'Vedi artista', onPress: () => router.push({ pathname: '/artist/[id]', params: { id: name } }) },
    ]);
  };

  const results = selected ? [] : searchWorks(query);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <FlatList
          data={results}
          keyExtractor={(w) => w.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.gap}>
              <ThemedText type="subtitle">Cattura</ThemedText>

              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
              ) : null}
              <View style={styles.buttons}>
                <Button label="Scatta foto" onPress={() => pick(true)} />
                <Button label="Dalla galleria" onPress={() => pick(false)} secondary />
              </View>

              {selected ? (
                <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="smallBold">{selected.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {selected.artist} · {selected.place}
                    {selected.city ? `, ${selected.city}` : ''}
                  </ThemedText>
                  <RarityBadge rarity={selected.rarity} />
                  {byWork.has(selected.id) ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      Già nel Pokédex: salvando aggiorni foto e nota.
                    </ThemedText>
                  ) : null}
                  <TextInput
                    placeholder="Nota (facoltativa)"
                    placeholderTextColor={theme.textSecondary}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                  <View style={styles.buttons}>
                    <Button label="Salva carta" onPress={save} />
                    <Button label="Cambia opera" onPress={() => setSelected(null)} secondary />
                  </View>
                </View>
              ) : (
                <>
                  <ThemedText themeColor="textSecondary">Che opera è? Cerca per titolo, artista o museo.</ThemedText>
                  <TextInput
                    placeholder="es. Bacco Uffizi"
                    placeholderTextColor={theme.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    autoCorrect={false}
                    style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              style={[styles.result, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.flex}>
                <ThemedText type="smallBold">
                  {byWork.has(item.id) ? '✓ ' : ''}
                  {item.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.artist} · {item.city || item.place}
                </ThemedText>
              </View>
              <RarityBadge rarity={item.rarity} />
            </Pressable>
          )}
          ListEmptyComponent={
            !selected && query.trim() ? (
              <ThemedText themeColor="textSecondary">Nessuna opera trovata nel catalogo.</ThemedText>
            ) : undefined
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function Button({ label, onPress, secondary }: { label: string; onPress: () => void; secondary?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        secondary ? { borderColor: theme.text, borderWidth: 1 } : { backgroundColor: theme.text },
      ]}>
      <ThemedText type="smallBold" style={{ color: secondary ? theme.text : theme.background }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  list: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.two },
  gap: { gap: Spacing.three, marginBottom: Spacing.two },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12 },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  button: { flex: 1, alignItems: 'center', paddingVertical: Spacing.two + 2, borderRadius: 10 },
  card: { padding: Spacing.three, borderRadius: 12, gap: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: Spacing.two + 2, fontSize: 16 },
  result: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: 12, gap: Spacing.two },
});
