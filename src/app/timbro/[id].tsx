import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ARTISTS, WORK_BY_ID } from '@/data/catalog';
import { Ink, RarityInk, Type } from '@/identity/grand-tour';
import { Postmark, Stamp } from '@/identity/stamp';
import { useCollection } from '@/state/collection';

/** One stamp: the reveal right after a capture, or its page in the notebook. */
export default function StampScreen() {
  const { id, nuovo } = useLocalSearchParams<{ id: string; nuovo?: string }>();
  const { byWork } = useCollection();
  const work = WORK_BY_ID.get(id);
  if (!work) return null;

  const cap = byWork.get(work.id);
  const owned = !!cap;
  const isNew = nuovo === '1';
  const r = RarityInk[work.rarity];
  const artist = ARTISTS.find((a) => a.id === work.artistId);
  const found = artist ? artist.works.filter((w) => w.counts === 'yes' && byWork.has(w.id)).length : 0;
  const date = cap ? new Date(cap.capturedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.kicker, { color: owned ? r.color : Ink.inkFaint }]}>
          {isNew ? 'Nuovo timbro nel taccuino' : owned ? 'Dal tuo taccuino' : 'Ancora da scoprire'}
        </Text>

        <View style={styles.stampWrap}>
          <Stamp work={work} owned={owned} photoUri={cap?.photoUri} size="large" />
          {owned && (
            <View style={styles.postmark}>
              <Postmark city={cap?.city || work.city || 'Italia'} date={date} />
            </View>
          )}
        </View>

        {owned ? (
          <>
            <Text style={[styles.points, { color: r.color }]}>+{work.points} punti</Text>
            {artist && work.counts === 'yes' && (
              <>
                <Text style={styles.progressText}>
                  {artist.name}: {found} di {artist.total} opere
                </Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(found / Math.max(1, artist.total)) * 100}%` }]} />
                </View>
              </>
            )}
            {work.counts !== 'yes' && <Text style={styles.progressText}>Carta bonus: fuori dal conteggio dell'artista</Text>}
          </>
        ) : (
          <Text style={styles.where}>
            La trovi a {work.place}
            {work.city ? `, ${work.city}` : ''}. Vale {work.points} punti.
          </Text>
        )}
        {!!work.note && !isNew && <Text style={styles.note}>{work.note}</Text>}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={() => router.dismissTo('/')} accessibilityRole="button">
          <Text style={styles.primaryText}>{isNew ? 'Continua il viaggio' : 'Torna alla fotocamera'}</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => (isNew ? router.replace('/taccuino') : router.back())} accessibilityRole="button">
          <Text style={styles.secondaryText}>{isNew ? 'Apri il taccuino' : 'Indietro'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Ink.paper },
  body: { padding: 24, alignItems: 'center', gap: 10 },
  kicker: { fontFamily: Type.label, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  stampWrap: { width: 270, marginTop: 14, marginBottom: 8 },
  postmark: { position: 'absolute', right: -34, bottom: 40 },
  points: { fontFamily: Type.display, fontSize: 40, fontWeight: '700' },
  progressText: { fontFamily: Type.body, fontSize: 14, color: Ink.inkSoft },
  track: { width: 220, height: 4, backgroundColor: Ink.paperEdge },
  fill: { height: 4, backgroundColor: Ink.stamp },
  where: { fontFamily: Type.displayItalic, fontStyle: 'italic', fontSize: 16, color: Ink.inkSoft, textAlign: 'center', marginTop: 8 },
  note: { fontFamily: Type.body, fontSize: 12, color: Ink.inkFaint, textAlign: 'center', marginTop: 8 },
  actions: { padding: 16, gap: 8 },
  primary: { backgroundColor: Ink.ink, paddingVertical: 16, borderRadius: 4, alignItems: 'center' },
  primaryText: { fontFamily: Type.label, color: Ink.paper, fontSize: 14, letterSpacing: 0.5 },
  secondary: { paddingVertical: 14, alignItems: 'center' },
  secondaryText: { fontFamily: Type.label, color: Ink.inkSoft, fontSize: 13 },
});
