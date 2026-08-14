"use client";

// ---------------------------------------------------------------------------
// The single client-side store. Wraps the storage adapter in React state,
// exposes the effective entry list plus all mutations, and persists on change.
// Swapping localStorage for a real backend means changing storage.ts only.
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SEED_ENTRIES } from "@/data/seed";
import { effectiveEntries, entryMap } from "./entries";
import { schedule, initialProgress } from "./srs";
import { storage, emptyData } from "./storage";
import {
  type CardProgress,
  type Grade,
  type ReviewEvent,
  type Settings,
  type StoredData,
  type StudyMode,
  type VocabEntry,
} from "./types";

interface StoreValue {
  hydrated: boolean;
  entries: VocabEntry[];
  seedEntries: VocabEntry[];
  byId: Map<string, VocabEntry>;
  progress: Record<string, CardProgress>;
  reviews: ReviewEvent[];
  settings: Settings;
  /** Apply an SM-2 grade to a card and log the review in one shot. */
  gradeCard: (entryId: string, grade: Grade, mode: StudyMode) => void;
  /** Log a result without touching the SM-2 schedule (used per-person in drills). */
  logReview: (entryId: string, correct: boolean, mode: StudyMode) => void;
  addEntry: (entry: VocabEntry) => void;
  updateEntry: (entry: VocabEntry) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  importAll: (data: StoredData) => void;
  exportData: StoredData;
  resetProgress: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoredData>(() => emptyData());
  const [hydrated, setHydrated] = useState(false);

  // Load persisted data once, on the client.
  useEffect(() => {
    setData(storage.load());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (hydrated) storage.save(data);
  }, [data, hydrated]);

  // Keep the theme class in sync with settings.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", data.settings.theme === "dark");
  }, [data.settings.theme]);

  const seedEntries = SEED_ENTRIES;

  const entries = useMemo(
    () => effectiveEntries(seedEntries, data),
    [seedEntries, data],
  );
  const byId = useMemo(() => entryMap(entries), [entries]);

  const gradeCard = useCallback(
    (entryId: string, grade: Grade, mode: StudyMode) => {
      const now = Date.now();
      setData((prev) => {
        const existing =
          prev.progress[entryId] ?? initialProgress(entryId, now);
        const nextProgress = schedule(existing, grade, now);
        const event: ReviewEvent = {
          entryId,
          ts: now,
          grade,
          correct: grade !== "again",
          mode,
        };
        return {
          ...prev,
          progress: { ...prev.progress, [entryId]: nextProgress },
          reviews: [...prev.reviews, event],
        };
      });
    },
    [],
  );

  const logReview = useCallback(
    (entryId: string, correct: boolean, mode: StudyMode) => {
      const now = Date.now();
      setData((prev) => {
        const event: ReviewEvent = {
          entryId,
          ts: now,
          grade: correct ? "good" : "again",
          correct,
          mode,
        };
        return { ...prev, reviews: [...prev.reviews, event] };
      });
    },
    [],
  );

  const addEntry = useCallback((entry: VocabEntry) => {
    setData((prev) => ({
      ...prev,
      customEntries: [...prev.customEntries, entry],
    }));
  }, []);

  const updateEntry = useCallback((entry: VocabEntry) => {
    setData((prev) => {
      const isCustom = prev.customEntries.some((e) => e.id === entry.id);
      if (isCustom) {
        return {
          ...prev,
          customEntries: prev.customEntries.map((e) =>
            e.id === entry.id ? entry : e,
          ),
        };
      }
      // Seed entry: store an override.
      return {
        ...prev,
        editedSeedEntries: { ...prev.editedSeedEntries, [entry.id]: entry },
      };
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setData((prev) => {
      const isCustom = prev.customEntries.some((e) => e.id === id);
      if (isCustom) {
        return {
          ...prev,
          customEntries: prev.customEntries.filter((e) => e.id !== id),
        };
      }
      const editedSeedEntries = { ...prev.editedSeedEntries };
      delete editedSeedEntries[id];
      return {
        ...prev,
        deletedSeedIds: prev.deletedSeedIds.includes(id)
          ? prev.deletedSeedIds
          : [...prev.deletedSeedIds, id],
        editedSeedEntries,
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const importAll = useCallback((incoming: StoredData) => {
    setData(incoming);
  }, []);

  const resetProgress = useCallback(() => {
    setData((prev) => ({ ...prev, progress: {}, reviews: [] }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      entries,
      seedEntries,
      byId,
      progress: data.progress,
      reviews: data.reviews,
      settings: data.settings,
      gradeCard,
      logReview,
      addEntry,
      updateEntry,
      deleteEntry,
      updateSettings,
      importAll,
      exportData: data,
      resetProgress,
    }),
    [
      hydrated,
      entries,
      seedEntries,
      byId,
      data,
      gradeCard,
      logReview,
      addEntry,
      updateEntry,
      deleteEntry,
      updateSettings,
      importAll,
      resetProgress,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
