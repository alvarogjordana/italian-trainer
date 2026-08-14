// ---------------------------------------------------------------------------
// Persistence layer. Everything that touches localStorage lives here and only
// here, behind a small StorageAdapter interface. To move to a real database
// later, implement the same interface and swap the exported `storage` value.
//
// All reads are validated with Zod; corrupt data falls back to a clean slate
// rather than throwing.
// ---------------------------------------------------------------------------

import { storedDataSchema } from "./schemas";
import {
  DEFAULT_SETTINGS,
  STORAGE_VERSION,
  type StoredData,
} from "./types";

const STORAGE_KEY = "italian-vocab:v1";

export function emptyData(): StoredData {
  return {
    version: STORAGE_VERSION,
    progress: {},
    reviews: [],
    customEntries: [],
    deletedSeedIds: [],
    editedSeedEntries: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

export interface StorageAdapter {
  load(): StoredData;
  save(data: StoredData): void;
  clear(): void;
}

/** Coerce arbitrary parsed JSON into a valid StoredData, filling gaps. */
export function parseStored(raw: unknown): StoredData {
  const result = storedDataSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  // Try a partial recovery: keep whatever top-level fields validate.
  const base = emptyData();
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const partial = storedDataSchema.partial().safeParse(obj);
    if (partial.success) {
      return { ...base, ...partial.data } as StoredData;
    }
  }
  return base;
}

class LocalStorageAdapter implements StorageAdapter {
  load(): StoredData {
    if (typeof window === "undefined") return emptyData();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyData();
      return parseStored(JSON.parse(raw));
    } catch {
      return emptyData();
    }
  }

  save(data: StoredData): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Quota exceeded or storage disabled — nothing safe to do here.
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();

// --- Import / export --------------------------------------------------------

export function exportJson(data: StoredData): string {
  return JSON.stringify(data, null, 2);
}

export interface ImportResult {
  ok: boolean;
  data?: StoredData;
  error?: string;
}

export function importJson(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }
  const result = storedDataSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: "The JSON does not match the expected backup format.",
    };
  }
  return { ok: true, data: result.data };
}
