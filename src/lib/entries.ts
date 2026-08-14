// ---------------------------------------------------------------------------
// Derives the "effective" vocabulary the user sees by layering their stored
// customisations on top of the read-only seed:
//   effective = (seed − deleted) with edits applied, then + custom entries
// Pure functions only.
// ---------------------------------------------------------------------------

import type { StoredData, VocabEntry } from "./types";

export function effectiveEntries(
  seed: VocabEntry[],
  stored: StoredData,
): VocabEntry[] {
  const deleted = new Set(stored.deletedSeedIds);
  const merged: VocabEntry[] = [];
  for (const entry of seed) {
    if (deleted.has(entry.id)) continue;
    const override = stored.editedSeedEntries[entry.id];
    merged.push(override ?? entry);
  }
  return [...merged, ...stored.customEntries];
}

export function entryMap(entries: VocabEntry[]): Map<string, VocabEntry> {
  return new Map(entries.map((e) => [e.id, e]));
}

/** True if the id belongs to the seed corpus (vs a user-created entry). */
export function isSeedId(seed: VocabEntry[], id: string): boolean {
  return seed.some((e) => e.id === id);
}

let customCounter = 0;
/** Generate a reasonably-unique id for a user-created entry. */
export function makeCustomId(now: number): string {
  customCounter += 1;
  return `custom-${now.toString(36)}-${customCounter.toString(36)}`;
}
