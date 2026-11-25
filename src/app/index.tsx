import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ink, Type } from '@/identity/grand-tour';
import { currentCity } from '@/recognition/location';
import { useCollection } from '@/state/collection';

/** Home: the camera. Frame a work, press once. */
export default function CameraScreen() {
  const [perm, requestPerm] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const { points } = useCollection();
  const [city, setCity] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    currentCity().then(setCity);
  }, []);

  const shoot = async () => {
    if (busy || !cam.current) return;
    setBusy(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const pic = await cam.current.takePictureAsync({ quality: 0.6 });
      if (pic?.uri) router.push({ pathname: '/riconosci', params: { uri: pic.uri, city: city ?? '' } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      {perm?.granted ? (
        <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={styles.noCam}>
          <Text style={styles.noCamTitle}>Il tuo taccuino ha bisogno di occhi</Text>
          <Text style={styles.noCamText}>Consenti la fotocamera per catturare le opere che incontri.</Text>
          <Pressable style={styles.allow} onPress={requestPerm} accessibilityRole="button">
            <Text style={styles.allowText}>Consenti fotocamera</Text>
          </Pressable>
        </View>
      )}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.top}>
          <View style={styles.pill}>
            <Text style={styles.pillText} numberOfLines={1}>
              {city ? `Sei a ${city}` : 'Dove sei?'}
            </Text>
          </View>
          <View style={styles.pill}>
            <Text style={[styles.pillText, { color: Ink.stamp }]}>{points.toLocaleString('it-IT')} pt</Text>
          </View>
        </View>

        {perm?.granted && (
          <View style={styles.frame} pointerEvents="none">
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
        )}

        <View style={styles.bottom}>
          <Text style={styles.hint}>Inquadra un'opera e premi il sigillo</Text>
          <View style={styles.bar}>
            <Pressable style={styles.side} onPress={() => router.push('/taccuino')} accessibilityLabel="Taccuino">
              <Text style={styles.sideIcon}>❧</Text>
              <Text style={styles.sideLabel}>Taccuino</Text>
            </Pressable>
            <Pressable
              style={[styles.seal, busy && { opacity: 0.6 }]}
              onPress={shoot}
              disabled={!perm?.granted}
              accessibilityLabel="Cattura opera">
              <View style={styles.sealInner}>
                <Text style={styles.sealText}>FA</Text>
              </View>
            </Pressable>
            <Pressable style={styles.side} onPress={() => router.push('/passaporto')} accessibilityLabel="Passaporto">
              <Text style={styles.sideIcon}>✠</Text>
              <Text style={styles.sideLabel}>Passaporto</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const C = 30;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Ink.night },
  overlay: { flex: 1, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  pill: { backgroundColor: 'rgba(243,235,221,0.92)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4, flexShrink: 1 },
  pillText: { fontFamily: Type.label, fontSize: 12, color: Ink.ink, letterSpacing: 0.5 },
  frame: { position: 'absolute', left: 48, right: 48, top: '22%', bottom: '30%' },
  corner: { position: 'absolute', width: C, height: C, borderColor: Ink.paper },
  tl: { left: 0, top: 0, borderLeftWidth: 2, borderTopWidth: 2 },
  tr: { right: 0, top: 0, borderRightWidth: 2, borderTopWidth: 2 },
  bl: { left: 0, bottom: 0, borderLeftWidth: 2, borderBottomWidth: 2 },
  br: { right: 0, bottom: 0, borderRightWidth: 2, borderBottomWidth: 2 },
  bottom: { paddingBottom: 12, alignItems: 'center', gap: 16 },
  hint: { fontFamily: Type.displayItalic, fontStyle: 'italic', fontSize: 15, color: Ink.paper },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 28 },
  side: { width: 76, height: 64, borderRadius: 6, backgroundColor: 'rgba(243,235,221,0.92)', alignItems: 'center', justifyContent: 'center' },
  sideIcon: { fontSize: 20, color: Ink.ink, fontFamily: Type.display },
  sideLabel: { fontFamily: Type.label, fontSize: 9, color: Ink.inkSoft, marginTop: 2, letterSpacing: 0.5 },
  seal: { width: 88, height: 88, borderRadius: 44, backgroundColor: Ink.stamp, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  sealInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'rgba(243,235,221,0.7)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  sealText: { fontFamily: Type.display, fontSize: 22, color: Ink.paper, fontWeight: '700', letterSpacing: 1 },
  noCam: { flex: 1, backgroundColor: Ink.paper, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  noCamTitle: { fontFamily: Type.display, fontSize: 24, color: Ink.ink, textAlign: 'center' },
  noCamText: { fontFamily: Type.body, fontSize: 15, color: Ink.inkSoft, textAlign: 'center' },
  allow: { marginTop: 8, backgroundColor: Ink.ink, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 4 },
  allowText: { fontFamily: Type.label, color: Ink.paper, fontSize: 13 },
});
