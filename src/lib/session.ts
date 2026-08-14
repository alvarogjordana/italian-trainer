// ---------------------------------------------------------------------------
// Builds review-session queues from the effective entries + progress. Pure.
// ---------------------------------------------------------------------------

import type {
  CardProgress,
  Direction,
  VocabEntry,
} from "./types";

export type ResolvedDirection = "it-es" | "es-it";

export interface QueueCard {
  entry: VocabEntry;
  direction: ResolvedDirection;
}

/** Deterministic 0/1 hash so "mixed" is stable within a session. */
function hashKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 2;
}

export function resolveDirection(
  pref: Direction,
  key: string,
): ResolvedDirection {
  if (pref === "it-es" || pref === "es-it") return pref;
  return hashKey(key) === 0 ? "it-es" : "es-it";
}

export interface QueueOptions {
  size: number;
  direction: Direction;
  /** Salt so different sessions shuffle "mixed" direction differently. */
  sessionSalt: string;
}

/**
 * Due review cards first (soonest first), then unseen cards, capped at size.
 */
export function buildQueue(
  entries: VocabEntry[],
  progress: Record<string, CardProgress>,
  now: number,
  opts: QueueOptions,
): QueueCard[] {
  const due: VocabEntry[] = [];
  const fresh: VocabEntry[] = [];
  for (const entry of entries) {
    const p = progress[entry.id];
    if (!p) fresh.push(entry);
    else if (p.nextReviewAt <= now) due.push(entry);
  }
  due.sort(
    (a, b) => progress[a.id]!.nextReviewAt - progress[b.id]!.nextReviewAt,
  );

  const ordered = [...due, ...fresh].slice(0, Math.max(1, opts.size));
  return ordered.map((entry) => ({
    entry,
    direction: resolveDirection(opts.direction, entry.id + opts.sessionSalt),
  }));
}

/**
 * Cram queue: every entry, soonest-scheduled (and unseen) first, ignoring the
 * due cutoff. Used for studying ahead when nothing is currently due.
 */
export function buildCramQueue(
  entries: VocabEntry[],
  progress: Record<string, CardProgress>,
  opts: QueueOptions,
): QueueCard[] {
  const ordered = [...entries]
    .sort(
      (a, b) =>
        (progress[a.id]?.nextReviewAt ?? 0) - (progress[b.id]?.nextReviewAt ?? 0),
    )
    .slice(0, Math.max(1, opts.size));
  return ordered.map((entry) => ({
    entry,
    direction: resolveDirection(opts.direction, entry.id + opts.sessionSalt),
  }));
}

/** The prompt and expected answer text for a card, given its direction. */
export function cardFaces(card: QueueCard): {
  promptLang: "it" | "es";
  answerLang: "it" | "es";
  prompt: string;
  answer: string;
} {
  const { entry, direction } = card;
  if (direction === "it-es") {
    return {
      promptLang: "it",
      answerLang: "es",
      prompt: entry.italian,
      answer: entry.spanish,
    };
  }
  return {
    promptLang: "es",
    answerLang: "it",
    prompt: entry.spanish,
    answer: entry.italian,
  };
}
