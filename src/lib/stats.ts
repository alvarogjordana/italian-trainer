// ---------------------------------------------------------------------------
// Derived statistics for the Stats screen. Pure functions over the stored
// progress / review log and the effective entry list.
// ---------------------------------------------------------------------------

import { masteryState, type MasteryState } from "./srs";
import type {
  CardProgress,
  ReviewEvent,
  VocabEntry,
  WordType,
} from "./types";
import { WORD_TYPES } from "./types";

export const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(ts: number): string {
  return new Date(startOfDay(ts)).toISOString().slice(0, 10);
}

/** Number of review cards currently due, and unseen (new) cards available. */
export function dueCounts(
  entries: VocabEntry[],
  progress: Record<string, CardProgress>,
  now: number,
): { due: number; newCards: number } {
  let due = 0;
  let newCards = 0;
  for (const entry of entries) {
    const p = progress[entry.id];
    if (!p) newCards += 1;
    else if (p.nextReviewAt <= now) due += 1;
  }
  return { due, newCards };
}

/** Current streak: consecutive days (ending today or yesterday) with a review. */
export function currentStreak(reviews: ReviewEvent[], now: number): number {
  if (reviews.length === 0) return 0;
  const days = new Set(reviews.map((r) => dayKey(r.ts)));
  let streak = 0;
  let cursor = startOfDay(now);
  // Allow the streak to still count if the user hasn't reviewed yet *today*
  // but did yesterday.
  if (!days.has(dayKey(cursor))) {
    cursor -= DAY;
    if (!days.has(dayKey(cursor))) return 0;
  }
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}

export interface DailyAccuracy {
  date: string;
  total: number;
  correct: number;
  accuracy: number; // 0..1, 0 when total is 0
}

/** Accuracy per day over the last `days` days (oldest first). */
export function accuracyOverDays(
  reviews: ReviewEvent[],
  now: number,
  days = 30,
): DailyAccuracy[] {
  const buckets = new Map<string, { total: number; correct: number }>();
  const start = startOfDay(now) - (days - 1) * DAY;
  for (let i = 0; i < days; i++) {
    buckets.set(dayKey(start + i * DAY), { total: 0, correct: 0 });
  }
  for (const r of reviews) {
    if (r.ts < start) continue;
    const key = dayKey(r.ts);
    const b = buckets.get(key);
    if (!b) continue;
    b.total += 1;
    if (r.correct) b.correct += 1;
  }
  return Array.from(buckets.entries()).map(([date, b]) => ({
    date,
    total: b.total,
    correct: b.correct,
    accuracy: b.total === 0 ? 0 : b.correct / b.total,
  }));
}

export function overallAccuracy(
  reviews: ReviewEvent[],
  now: number,
  days = 30,
): { total: number; correct: number; accuracy: number } {
  const start = startOfDay(now) - (days - 1) * DAY;
  let total = 0;
  let correct = 0;
  for (const r of reviews) {
    if (r.ts < start) continue;
    total += 1;
    if (r.correct) correct += 1;
  }
  return { total, correct, accuracy: total === 0 ? 0 : correct / total };
}

export type MasteryBreakdown = Record<
  WordType,
  Record<MasteryState, number>
>;

export function masteryByType(
  entries: VocabEntry[],
  progress: Record<string, CardProgress>,
): MasteryBreakdown {
  const empty = (): Record<MasteryState, number> => ({
    new: 0,
    learning: 0,
    mastered: 0,
  });
  const result = Object.fromEntries(
    WORD_TYPES.map((t) => [t, empty()]),
  ) as MasteryBreakdown;
  for (const entry of entries) {
    const state = masteryState(progress[entry.id]);
    result[entry.type][state] += 1;
  }
  return result;
}

export interface WeakEntry {
  entry: VocabEntry;
  progress: CardProgress;
  score: number;
}

/** Weakness score — higher means the user struggles more with the card. */
export function weaknessScore(p: CardProgress): number {
  const lapsePenalty = p.lapses * 3;
  const easePenalty = Math.max(0, 2.7 - p.easeFactor) * 4;
  const recentAgain = p.lastResult === "again" ? 3 : 0;
  const hardPenalty = p.lastResult === "hard" ? 1 : 0;
  return lapsePenalty + easePenalty + recentAgain + hardPenalty;
}

export function weakestEntries(
  entries: VocabEntry[],
  progress: Record<string, CardProgress>,
  limit = 20,
): WeakEntry[] {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const scored: WeakEntry[] = [];
  for (const p of Object.values(progress)) {
    const entry = byId.get(p.id);
    if (!entry || p.repetitions === 0) continue;
    const score = weaknessScore(p);
    if (score <= 0) continue;
    scored.push({ entry, progress: p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
