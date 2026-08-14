"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { normalize } from "@/lib/normalize";
import {
  PERSONS,
  PERSON_LABELS,
  TENSES,
  TENSE_LABELS,
  isVerb,
  type Person,
  type Tense,
  type VerbEntry,
} from "@/lib/types";
import { SpeakerButton } from "./SpeakerButton";
import { Button, Card, CefrBadge, EmptyState, PageHeader, Spinner } from "./ui";
import { cn } from "@/lib/cn";

/** Accepts the canonical form, apostrophe-insensitive and accent-insensitive. */
function matchConj(answer: string, correct: string): boolean {
  const strip = (s: string) => normalize(s).replace(/['’]/g, "");
  return strip(answer) === strip(correct);
}

export function VerbDrill() {
  const { hydrated, entries, gradeCard, logReview } = useStore();

  const verbs = useMemo(
    () => entries.filter(isVerb).sort((a, b) => a.infinitive.localeCompare(b.infinitive)),
    [entries],
  );

  const [verbId, setVerbId] = useState<string>("");
  const [tense, setTense] = useState<Tense>("presente");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean> | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  // Default to the first verb once loaded.
  useEffect(() => {
    if (!verbId && verbs.length > 0) setVerbId(verbs[0]!.id);
  }, [verbs, verbId]);

  const verb: VerbEntry | undefined = useMemo(
    () => verbs.find((v) => v.id === verbId),
    [verbs, verbId],
  );

  const conj = verb?.conjugations[tense];
  const activePersons = useMemo<Person[]>(
    () => (conj ? PERSONS.filter((p) => conj[p].trim() !== "") : []),
    [conj],
  );

  const reset = () => {
    setAnswers({});
    setResults(null);
  };

  // Reset inputs whenever the verb or tense changes.
  useEffect(() => {
    reset();
  }, [verbId, tense]);

  if (!hydrated) return <Spinner />;
  if (verbs.length === 0) {
    return (
      <div>
        <PageHeader title="Verbi" />
        <EmptyState icon="🔤" title="Nessun verbo disponibile" />
      </div>
    );
  }

  const check = () => {
    if (!conj) return;
    const res: Record<string, boolean> = {};
    let correct = 0;
    for (const p of activePersons) {
      const ok = matchConj(answers[p] ?? "", conj[p]);
      res[p] = ok;
      if (ok) correct += 1;
      logReview(verbId, ok, "verb");
    }
    setResults(res);
    if (verb) {
      const allCorrect = correct === activePersons.length;
      gradeCard(verb.id, allCorrect ? "good" : "hard", "verb");
    }
  };

  const pickRandom = () => {
    const v = verbs[Math.floor(Math.random() * verbs.length)]!;
    const t = TENSES[Math.floor(Math.random() * TENSES.length)]!;
    setVerbId(v.id);
    setTense(t);
  };

  const focusNext = (index: number) => {
    const nextPerson = activePersons[index + 1];
    if (nextPerson) inputs.current[nextPerson]?.focus();
    else check();
  };

  const correctCount = results
    ? activePersons.filter((p) => results[p]).length
    : 0;

  return (
    <div>
      <PageHeader
        title="Verbi"
        subtitle="Coniuga tutte le persone e ricevi un riscontro immediato."
      />

      <Card className="mb-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Verbo</span>
            <select
              value={verbId}
              onChange={(e) => setVerbId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {verbs.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.infinitive} — {v.spanish}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Tempo</span>
            <select
              value={tense}
              onChange={(e) => setTense(e.target.value as Tense)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {TENSES.map((t) => (
                <option key={t} value={t}>
                  {TENSE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={pickRandom}>
            🎲 Verbo a caso
          </Button>
        </div>
      </Card>

      {verb && conj && (
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg font-bold">{verb.infinitive}</span>
            <SpeakerButton text={verb.infinitive} size="sm" />
            <CefrBadge level={verb.cefr} />
            <span className="ml-auto text-sm text-muted">
              {TENSE_LABELS[tense]}
            </span>
          </div>
          <p className="mb-4 text-xs text-muted">
            {verb.spanish} · {verb.english}
            {verb.isIrregular && " · irregolare"}
          </p>

          <div className="space-y-2">
            {activePersons.map((p, i) => {
              const ok = results?.[p];
              return (
                <div key={p} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-sm text-muted">
                    {PERSON_LABELS[p]}
                  </span>
                  <input
                    ref={(el) => {
                      inputs.current[p] = el;
                    }}
                    value={answers[p] ?? ""}
                    disabled={results !== null}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [p]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (results === null) focusNext(i);
                      }
                      if (e.key === "Escape") reset();
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="…"
                    className={cn(
                      "flex-1 rounded-lg border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors",
                      results === null && "border-border focus:border-accent",
                      ok === true && "border-success text-success",
                      ok === false && "border-danger",
                    )}
                  />
                  {results !== null && (
                    <div className="flex w-40 shrink-0 items-center gap-1.5">
                      {ok ? (
                        <span className="text-success">✓</span>
                      ) : (
                        <>
                          <span className="text-danger">✗</span>
                          <span className="truncate text-sm font-medium">
                            {conj[p]}
                          </span>
                        </>
                      )}
                      <SpeakerButton text={conj[p]} size="sm" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2">
            {results === null ? (
              <Button className="flex-1" onClick={check}>
                Controlla
              </Button>
            ) : (
              <>
                <div
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold",
                    correctCount === activePersons.length
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning",
                  )}
                >
                  {correctCount}/{activePersons.length} corrette
                </div>
                <Button variant="outline" onClick={reset}>
                  Riprova
                </Button>
                <Button onClick={pickRandom}>Prossimo →</Button>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
