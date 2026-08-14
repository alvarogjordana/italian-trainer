// ---------------------------------------------------------------------------
// SM-2 spaced-repetition scheduler.
//
// Pure, deterministic functions: every function that depends on "now" takes it
// as an argument so the behaviour is fully testable. Nothing here touches
// storage, React, or the DOM.
//
// We use the classic SuperMemo-2 algorithm with a 4-button grading front-end
// (Again / Hard / Good / Easy) mapped onto SM-2 quality scores.
// ---------------------------------------------------------------------------

import type { CardProgress, Grade } from "./types";

export const DAY_MS = 24 * 60 * 60 * 1000;

export const MIN_EASE = 1.3;
export const INITIAL_EASE = 2.5;

/** Interval (days) at or above which a card is considered "mastered". */
export const MATURE_INTERVAL = 21;

export type MasteryState = "new" | "learning" | "mastered";

/** Fresh progress for a card that has never been reviewed. */
export function initialProgress(id: string, now: number): CardProgress {
  return {
    id,
    easeFactor: INITIAL_EASE,
    interval: 0,
    repetitions: 0,
    nextReviewAt: now, // due immediately
    lapses: 0,
    lastResult: null,
    lastReviewedAt: null,
  };
}

/** Map a 4-button grade to an SM-2 quality score (0-5). */
export function qualityFor(grade: Grade): number {
  switch (grade) {
    case "again":
      return 2;
    case "hard":
      return 3;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}

/** Standard SM-2 ease-factor update, clamped at a floor of MIN_EASE. */
export function updateEaseFactor(ease: number, quality: number): number {
  const next = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(MIN_EASE, Math.round(next * 100) / 100);
}

/**
 * Compute the next state of a card given the grade the user assigned.
 * Returns a brand-new CardProgress object (never mutates the input).
 */
export function schedule(
  prev: CardProgress,
  grade: Grade,
  now: number,
): CardProgress {
  const quality = qualityFor(grade);
  const easeFactor = updateEaseFactor(prev.easeFactor, quality);

  // "Again" — the card lapsed. Reset the learning progression and make it due
  // again immediately so it re-enters the current session's queue.
  if (grade === "again") {
    return {
      ...prev,
      easeFactor,
      interval: 0,
      repetitions: 0,
      nextReviewAt: now,
      lapses: prev.lapses + 1,
      lastResult: grade,
      lastReviewedAt: now,
    };
  }

  const repetitions = prev.repetitions + 1;
  let interval: number;

  if (repetitions === 1) {
    interval = grade === "easy" ? 4 : 1;
  } else if (repetitions === 2) {
    interval = grade === "hard" ? 3 : 6;
  } else {
    const factor =
      grade === "hard" ? 1.2 : grade === "easy" ? easeFactor * 1.3 : easeFactor;
    interval = Math.round(prev.interval * factor);
  }

  interval = Math.max(1, interval);

  return {
    ...prev,
    easeFactor,
    interval,
    repetitions,
    nextReviewAt: now + interval * DAY_MS,
    lapses: prev.lapses,
    lastResult: grade,
    lastReviewedAt: now,
  };
}

export function isDue(progress: CardProgress, now: number): boolean {
  return progress.nextReviewAt <= now;
}

export function masteryState(progress: CardProgress | undefined): MasteryState {
  if (!progress || progress.repetitions === 0) return "new";
  if (progress.interval >= MATURE_INTERVAL) return "mastered";
  return "learning";
}
