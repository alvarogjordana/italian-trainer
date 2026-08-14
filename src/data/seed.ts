// ---------------------------------------------------------------------------
// The seed vocabulary: 40 irregular verbs + curated nouns, adjectives,
// adverbs, expressions, conjunctions and prepositions. This is the read-only
// starting corpus; user additions/edits live in localStorage on top of it.
// ---------------------------------------------------------------------------

import type { VocabEntry } from "@/lib/types";
import { verbs } from "./verbs";
import { nounsA } from "./words-nouns-a";
import { nounsB } from "./words-nouns-b";
import { modifiers } from "./words-modifiers";
import { connectors } from "./words-connectors";

export const SEED_ENTRIES: VocabEntry[] = [
  ...verbs,
  ...nounsA,
  ...nounsB,
  ...modifiers,
  ...connectors,
];

/** All distinct theme tags present in the seed, sorted. */
export const SEED_TAGS: string[] = Array.from(
  new Set(SEED_ENTRIES.flatMap((e) => e.tags)),
).sort();
