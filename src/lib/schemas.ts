// ---------------------------------------------------------------------------
// Zod schemas. Anything read back from localStorage is validated through
// storedDataSchema so corrupt / stale data can never crash the app.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { PERSONS, TENSES } from "./types";

export const genderSchema = z.enum(["m", "f"]);
export const cefrSchema = z.enum(["A1", "A2", "B1", "B2"]);
export const gradeSchema = z.enum(["again", "hard", "good", "easy"]);
export const directionSchema = z.enum(["it-es", "es-it", "mixed"]);
export const studyModeSchema = z.enum(["review", "typing", "verb"]);

const conjugationSchema = z.object(
  Object.fromEntries(PERSONS.map((p) => [p, z.string()])) as Record<
    (typeof PERSONS)[number],
    z.ZodString
  >,
);

const conjugationsSchema = z.object(
  Object.fromEntries(TENSES.map((t) => [t, conjugationSchema])) as Record<
    (typeof TENSES)[number],
    typeof conjugationSchema
  >,
);

const baseFields = {
  id: z.string().min(1),
  italian: z.string().min(1),
  spanish: z.string().min(1),
  english: z.string().min(1),
  gender: genderSchema.nullish(),
  plural: z.string().nullish(),
  notes: z.string().nullish(),
  exampleIt: z.string().nullish(),
  exampleEs: z.string().nullish(),
  tags: z.array(z.string()),
  cefr: cefrSchema,
};

const nonVerbSchema = z.object({
  ...baseFields,
  type: z.enum([
    "noun",
    "adjective",
    "adverb",
    "expression",
    "conjunction",
    "preposition",
  ]),
});

const verbSchema = z.object({
  ...baseFields,
  type: z.literal("verb"),
  infinitive: z.string().min(1),
  isIrregular: z.boolean(),
  conjugations: conjugationsSchema,
});

export const vocabEntrySchema = z.discriminatedUnion("type", [
  nonVerbSchema,
  verbSchema,
]);

export const cardProgressSchema = z.object({
  id: z.string(),
  easeFactor: z.number(),
  interval: z.number(),
  repetitions: z.number(),
  nextReviewAt: z.number(),
  lapses: z.number(),
  lastResult: gradeSchema.nullable(),
  lastReviewedAt: z.number().nullable(),
});

export const reviewEventSchema = z.object({
  entryId: z.string(),
  ts: z.number(),
  grade: gradeSchema,
  correct: z.boolean(),
  mode: studyModeSchema,
});

export const settingsSchema = z.object({
  direction: directionSchema,
  sessionSize: z.number().int().min(1).max(200),
  theme: z.enum(["dark", "light"]),
});

export const storedDataSchema = z.object({
  version: z.number(),
  progress: z.record(z.string(), cardProgressSchema),
  reviews: z.array(reviewEventSchema),
  customEntries: z.array(vocabEntrySchema),
  deletedSeedIds: z.array(z.string()),
  editedSeedEntries: z.record(z.string(), vocabEntrySchema),
  settings: settingsSchema,
});

export type StoredDataParsed = z.infer<typeof storedDataSchema>;
