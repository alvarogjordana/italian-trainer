import { describe, it, expect } from "vitest";
import {
  DAY_MS,
  INITIAL_EASE,
  MIN_EASE,
  initialProgress,
  qualityFor,
  updateEaseFactor,
  schedule,
  isDue,
  masteryState,
} from "./srs";
import type { CardProgress } from "./types";

const NOW = 1_700_000_000_000; // fixed reference instant

function fresh(): CardProgress {
  return initialProgress("x", NOW);
}

describe("initialProgress", () => {
  it("creates a card due immediately with default ease", () => {
    const p = fresh();
    expect(p.easeFactor).toBe(INITIAL_EASE);
    expect(p.interval).toBe(0);
    expect(p.repetitions).toBe(0);
    expect(p.nextReviewAt).toBe(NOW);
    expect(p.lapses).toBe(0);
    expect(p.lastResult).toBeNull();
  });
});

describe("qualityFor", () => {
  it("maps grades to SM-2 quality scores", () => {
    expect(qualityFor("again")).toBe(2);
    expect(qualityFor("hard")).toBe(3);
    expect(qualityFor("good")).toBe(4);
    expect(qualityFor("easy")).toBe(5);
  });
});

describe("updateEaseFactor", () => {
  it("leaves ease roughly unchanged on 'good' (q=4)", () => {
    expect(updateEaseFactor(2.5, 4)).toBeCloseTo(2.5, 5);
  });

  it("raises ease on 'easy' (q=5)", () => {
    expect(updateEaseFactor(2.5, 5)).toBeGreaterThan(2.5);
  });

  it("lowers ease on 'hard' (q=3)", () => {
    expect(updateEaseFactor(2.5, 3)).toBeLessThan(2.5);
  });

  it("never drops below the floor", () => {
    expect(updateEaseFactor(1.3, 2)).toBe(MIN_EASE);
    expect(updateEaseFactor(1.3, 0)).toBe(MIN_EASE);
  });
});

describe("schedule — first review", () => {
  it("Good on a new card gives a 1-day interval", () => {
    const p = schedule(fresh(), "good", NOW);
    expect(p.repetitions).toBe(1);
    expect(p.interval).toBe(1);
    expect(p.nextReviewAt).toBe(NOW + 1 * DAY_MS);
    expect(p.lastResult).toBe("good");
  });

  it("Easy on a new card gives a longer first interval", () => {
    const p = schedule(fresh(), "easy", NOW);
    expect(p.interval).toBe(4);
    expect(p.repetitions).toBe(1);
  });

  it("does not mutate the input", () => {
    const p = fresh();
    const before = { ...p };
    schedule(p, "good", NOW);
    expect(p).toEqual(before);
  });
});

describe("schedule — Again / lapse", () => {
  it("resets repetitions, increments lapses, and is due now", () => {
    let p = schedule(fresh(), "good", NOW); // reps 1
    p = schedule(p, "good", NOW + DAY_MS); // reps 2, interval 6
    const lapsed = schedule(p, "again", NOW + 7 * DAY_MS);
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.interval).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.nextReviewAt).toBe(NOW + 7 * DAY_MS);
    expect(lapsed.easeFactor).toBeLessThan(p.easeFactor);
  });
});

describe("schedule — progression", () => {
  it("follows 1 → 6 → ef-scaled on repeated Good grades", () => {
    let p = schedule(fresh(), "good", NOW);
    expect(p.interval).toBe(1);
    p = schedule(p, "good", p.nextReviewAt);
    expect(p.interval).toBe(6);
    const third = schedule(p, "good", p.nextReviewAt);
    // third interval = round(6 * ease). ease ~2.5 → ~15
    expect(third.interval).toBe(Math.round(6 * p.easeFactor));
    expect(third.interval).toBeGreaterThan(6);
  });

  it("Hard produces a shorter interval than Good at the same step", () => {
    let base = schedule(fresh(), "good", NOW);
    base = schedule(base, "good", base.nextReviewAt); // interval 6, reps 2
    const good = schedule(base, "good", base.nextReviewAt);
    const hard = schedule(base, "hard", base.nextReviewAt);
    expect(hard.interval).toBeLessThan(good.interval);
  });

  it("Easy produces a longer interval than Good at the same step", () => {
    let base = schedule(fresh(), "good", NOW);
    base = schedule(base, "good", base.nextReviewAt);
    const good = schedule(base, "good", base.nextReviewAt);
    const easy = schedule(base, "easy", base.nextReviewAt);
    expect(easy.interval).toBeGreaterThan(good.interval);
  });

  it("intervals are always at least 1 day on a pass", () => {
    let p = schedule(fresh(), "hard", NOW);
    for (let i = 0; i < 5; i++) {
      p = schedule(p, "hard", p.nextReviewAt);
      expect(p.interval).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("isDue", () => {
  it("is true when nextReviewAt is in the past", () => {
    const p = schedule(fresh(), "good", NOW);
    expect(isDue(p, NOW)).toBe(false);
    expect(isDue(p, p.nextReviewAt)).toBe(true);
    expect(isDue(p, p.nextReviewAt + 1)).toBe(true);
  });
});

describe("masteryState", () => {
  it("is 'new' with no reviews", () => {
    expect(masteryState(undefined)).toBe("new");
    expect(masteryState(fresh())).toBe("new");
  });

  it("is 'learning' after a pass with a short interval", () => {
    const p = schedule(fresh(), "good", NOW);
    expect(masteryState(p)).toBe("learning");
  });

  it("is 'mastered' once the interval reaches 21 days", () => {
    const p: CardProgress = { ...fresh(), repetitions: 5, interval: 30 };
    expect(masteryState(p)).toBe("mastered");
  });
});
