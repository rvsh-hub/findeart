import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Ink } from '@/identity/grand-tour';
import { CollectionProvider } from '@/state/collection';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <CollectionProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Ink.paper } }}>
        <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: Ink.night } }} />
        <Stack.Screen name="riconosci" options={{ presentation: 'modal' }} />
        <Stack.Screen name="timbro/[id]" options={{ animation: 'fade' }} />
      </Stack>
    </CollectionProvider>
  );
}
