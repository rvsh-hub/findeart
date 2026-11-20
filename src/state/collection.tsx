import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WORK_BY_ID } from '@/data/catalog';

export type Capture = {
  workId: string;
  photoUri: string | null;
  note: string;
  capturedAt: string; // ISO date
};

const KEY = 'findeart.captures.v1';

type Ctx = {
  captures: Capture[];
  byWork: Map<string, Capture>;
  points: number;
  addCapture: (c: Omit<Capture, 'capturedAt'>) => void;
  removeCapture: (workId: string) => void;
};

const CollectionContext = createContext<Ctx | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((s) => s && setCaptures(JSON.parse(s)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(captures)).catch(() => {});
  }, [captures, loaded]);

  const addCapture = useCallback((c: Omit<Capture, 'capturedAt'>) => {
    setCaptures((prev) => [
      { ...c, capturedAt: new Date().toISOString() },
      ...prev.filter((p) => p.workId !== c.workId),
    ]);
  }, []);

  const removeCapture = useCallback((workId: string) => {
    setCaptures((prev) => prev.filter((p) => p.workId !== workId));
  }, []);

  const value = useMemo(() => {
    const byWork = new Map(captures.map((c) => [c.workId, c]));
    const points = captures.reduce((s, c) => s + (WORK_BY_ID.get(c.workId)?.points ?? 0), 0);
    return { captures, byWork, points, addCapture, removeCapture };
  }, [captures, addCapture, removeCapture]);

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used inside CollectionProvider');
  return ctx;
}
