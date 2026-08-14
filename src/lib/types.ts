// ---------------------------------------------------------------------------
// Core domain types for the Italian vocabulary app.
// These are the single source of truth; Zod schemas in schemas.ts mirror them.
// ---------------------------------------------------------------------------

export type WordType =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "expression"
  | "conjunction"
  | "preposition";

export const WORD_TYPES: WordType[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "expression",
  "conjunction",
  "preposition",
];

export type Gender = "m" | "f";

export type Cefr = "A1" | "A2" | "B1" | "B2";

export const CEFR_LEVELS: Cefr[] = ["A1", "A2", "B1", "B2"];

// Grammatical persons. Imperativo has no first-person singular, so its `io`
// slot is stored as an empty string and skipped by consumers.
export type Person = "io" | "tu" | "lui" | "noi" | "voi" | "loro";

export const PERSONS: Person[] = ["io", "tu", "lui", "noi", "voi", "loro"];

export const PERSON_LABELS: Record<Person, string> = {
  io: "io",
  tu: "tu",
  lui: "lui/lei",
  noi: "noi",
  voi: "voi",
  loro: "loro",
};

export type Tense =
  | "presente"
  | "passatoProssimo"
  | "imperfetto"
  | "futuroSemplice"
  | "condizionale"
  | "congiuntivoPresente"
  | "imperativo";

export const TENSES: Tense[] = [
  "presente",
  "passatoProssimo",
  "imperfetto",
  "futuroSemplice",
  "condizionale",
  "congiuntivoPresente",
  "imperativo",
];

export const TENSE_LABELS: Record<Tense, string> = {
  presente: "Presente",
  passatoProssimo: "Passato prossimo",
  imperfetto: "Imperfetto",
  futuroSemplice: "Futuro semplice",
  condizionale: "Condizionale presente",
  congiuntivoPresente: "Congiuntivo presente",
  imperativo: "Imperativo",
};

export type Conjugation = Record<Person, string>;

export type Conjugations = Record<Tense, Conjugation>;

interface BaseEntry {
  id: string;
  italian: string;
  spanish: string;
  english: string;
  type: WordType;
  /** Nouns only. */
  gender?: Gender | null;
  /** Plural form (nouns/adjectives), when notable. */
  plural?: string | null;
  notes?: string | null;
  exampleIt?: string | null;
  exampleEs?: string | null;
  tags: string[];
  cefr: Cefr;
}

export interface NonVerbEntry extends BaseEntry {
  type: Exclude<WordType, "verb">;
}

export interface VerbEntry extends BaseEntry {
  type: "verb";
  infinitive: string;
  isIrregular: boolean;
  conjugations: Conjugations;
}

export type VocabEntry = NonVerbEntry | VerbEntry;

export function isVerb(entry: VocabEntry): entry is VerbEntry {
  return entry.type === "verb";
}

// --- Spaced repetition ------------------------------------------------------

export type Grade = "again" | "hard" | "good" | "easy";

export const GRADES: Grade[] = ["again", "hard", "good", "easy"];

export interface CardProgress {
  id: string; // entry id
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReviewAt: number; // epoch ms
  lapses: number;
  lastResult: Grade | null;
  lastReviewedAt: number | null;
}

export type StudyMode = "review" | "typing" | "verb";

export interface ReviewEvent {
  entryId: string;
  ts: number; // epoch ms
  grade: Grade;
  correct: boolean;
  mode: StudyMode;
}

// --- Settings ---------------------------------------------------------------

export type Direction = "it-es" | "es-it" | "mixed";

export interface Settings {
  direction: Direction;
  sessionSize: number;
  theme: "dark" | "light";
}

export const DEFAULT_SETTINGS: Settings = {
  direction: "it-es",
  sessionSize: 20,
  theme: "dark",
};

// --- Persisted shape --------------------------------------------------------

export interface StoredData {
  version: number;
  progress: Record<string, CardProgress>;
  reviews: ReviewEvent[];
  /** User-created entries. */
  customEntries: VocabEntry[];
  /** Ids of seed entries the user removed. */
  deletedSeedIds: string[];
  /** Overrides for edited seed entries, keyed by id. */
  editedSeedEntries: Record<string, VocabEntry>;
  settings: Settings;
}

export const STORAGE_VERSION = 1;
