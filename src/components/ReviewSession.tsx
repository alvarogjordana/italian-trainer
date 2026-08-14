"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  buildQueue,
  buildCramQueue,
  cardFaces,
  type QueueCard,
} from "@/lib/session";
import { dueCounts } from "@/lib/stats";
import { GRADES, type Direction, type Grade } from "@/lib/types";
import { isVerb } from "@/lib/types";
import { SpeakerButton } from "./SpeakerButton";
import {
  Button,
  Card,
  CefrBadge,
  EmptyState,
  PageHeader,
  Segmented,
  Spinner,
  TypeBadge,
} from "./ui";
import { cn } from "@/lib/cn";

type Phase = "idle" | "running" | "done";

const GRADE_META: Record<
  Grade,
  { label: string; key: string; cls: string; hint: string }
> = {
  again: { label: "Di nuovo", key: "1", cls: "bg-danger/15 text-danger border-danger/40", hint: "< 1 min" },
  hard: { label: "Difficile", key: "2", cls: "bg-warning/15 text-warning border-warning/40", hint: "" },
  good: { label: "Bene", key: "3", cls: "bg-accent/15 text-accent border-accent/40", hint: "" },
  easy: { label: "Facile", key: "4", cls: "bg-success/15 text-success border-success/40", hint: "" },
};

const DIRECTION_OPTS: { value: Direction; label: string }[] = [
  { value: "it-es", label: "IT → ES" },
  { value: "es-it", label: "ES → IT" },
  { value: "mixed", label: "Misto" },
];

export function ReviewSession() {
  const store = useStore();
  const { hydrated, entries, progress, settings, gradeCard, updateSettings } =
    store;

  const [phase, setPhase] = useState<Phase>("idle");
  const [queue, setQueue] = useState<QueueCard[]>([]);
  const [total, setTotal] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<Grade, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const counts = useMemo(
    () => (hydrated ? dueCounts(entries, progress, Date.now()) : { due: 0, newCards: 0 }),
    [hydrated, entries, progress],
  );

  const startSession = useCallback(
    (cram: boolean) => {
      const now = Date.now();
      const opts = {
        size: settings.sessionSize,
        direction: settings.direction,
        sessionSalt: String(now),
      };
      const q = cram
        ? buildCramQueue(entries, progress, opts)
        : buildQueue(entries, progress, now, opts);
      if (q.length === 0) return;
      setQueue(q);
      setTotal(q.length);
      setTally({ again: 0, hard: 0, good: 0, easy: 0 });
      setFlipped(false);
      setPhase("running");
    },
    [entries, progress, settings.sessionSize, settings.direction],
  );

  const current = queue[0];

  const grade = useCallback(
    (g: Grade) => {
      if (!current) return;
      gradeCard(current.entry.id, g, "review");
      setTally((t) => ({ ...t, [g]: t[g] + 1 }));
      setQueue((q) => {
        const [head, ...rest] = q;
        // "Again" cards go to the back of the current session to be relearned.
        const next = g === "again" && head ? [...rest, head] : rest;
        if (next.length === 0) setPhase("done");
        return next;
      });
      setFlipped(false);
    },
    [current, gradeCard],
  );

  const exit = useCallback(() => {
    setPhase("idle");
    setQueue([]);
    setFlipped(false);
  }, []);

  // Keyboard: space flips, 1-4 grade, Esc exits.
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
        return;
      }
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (e.key === "Enter" && !flipped) {
        e.preventDefault();
        setFlipped(true);
        return;
      }
      if (flipped) {
        const idx = ["1", "2", "3", "4"].indexOf(e.key);
        if (idx >= 0) {
          e.preventDefault();
          grade(GRADES[idx]!);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, flipped, grade, exit]);

  if (!hydrated) return <Spinner />;

  // ---- DONE ---------------------------------------------------------------
  if (phase === "done") {
    const reviewed = tally.again + tally.hard + tally.good + tally.easy;
    const correct = tally.hard + tally.good + tally.easy;
    const pct = reviewed === 0 ? 0 : Math.round((correct / reviewed) * 100);
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <div className="mb-2 text-5xl">🎉</div>
          <h2 className="text-xl font-bold">Sessione completata!</h2>
          <p className="mt-1 text-sm text-muted">
            Hai ripassato {total} {total === 1 ? "carta" : "carte"}.
          </p>
          <div className="my-5 grid grid-cols-2 gap-2 text-sm">
            <Stat label="Risposte" value={reviewed} />
            <Stat label="Precisione" value={`${pct}%`} />
            {GRADES.map((g) => (
              <div
                key={g}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left",
                  GRADE_META[g].cls,
                )}
              >
                <div className="text-lg font-bold">{tally[g]}</div>
                <div className="text-xs opacity-80">{GRADE_META[g].label}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={() => startSession(false)}>Ancora</Button>
            <Button variant="outline" onClick={exit}>
              Fine
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- RUNNING ------------------------------------------------------------
  if (phase === "running" && current) {
    const faces = cardFaces(current);
    const { entry } = current;
    const progressPct = Math.round(((total - queue.length) / total) * 100);
    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted">
            {total - queue.length}/{total}
          </span>
          <button
            onClick={exit}
            className="rounded-md px-2 py-1 text-xs text-muted hover:text-fg"
            title="Esci (Esc)"
          >
            Esc
          </button>
        </div>

        <Card
          className="min-h-[19rem] cursor-pointer select-none"

        >
          <div
            onClick={() => setFlipped((f) => !f)}
            className="flex h-full flex-col"
          >
            <div className="mb-4 flex items-center gap-2">
              <TypeBadge type={entry.type} />
              <CefrBadge level={entry.cefr} />
              <span className="ml-auto text-xs uppercase tracking-wide text-muted">
                {faces.promptLang === "it" ? "italiano" : "español"}
              </span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold sm:text-4xl">
                  {faces.prompt}
                </span>
                {faces.promptLang === "it" && (
                  <SpeakerButton text={entry.italian} size="lg" />
                )}
              </div>
              {entry.type === "noun" && entry.gender && (
                <span className="text-sm text-muted">
                  {entry.gender === "m" ? "il / lo" : "la"} ·{" "}
                  {entry.gender === "m" ? "maschile" : "femminile"}
                </span>
              )}

              {flipped && (
                <div className="mt-3 w-full space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-semibold text-accent sm:text-3xl">
                      {faces.answer}
                    </span>
                    {faces.answerLang === "it" && (
                      <SpeakerButton text={entry.italian} />
                    )}
                  </div>
                  <div className="text-sm text-muted">{entry.english}</div>
                  {isVerb(entry) && (
                    <div className="text-xs text-muted">
                      infinito: <span className="font-medium">{entry.infinitive}</span>
                    </div>
                  )}
                  {entry.exampleIt && (
                    <div className="rounded-lg bg-surface-2 p-3 text-left text-sm">
                      <div className="flex items-start gap-2">
                        <span className="italic">{entry.exampleIt}</span>
                        <SpeakerButton text={entry.exampleIt} size="sm" className="mt-0.5" />
                      </div>
                      {entry.exampleEs && (
                        <div className="mt-1 text-muted">{entry.exampleEs}</div>
                      )}
                    </div>
                  )}
                  {entry.notes && (
                    <div className="text-xs text-muted">{entry.notes}</div>
                  )}
                </div>
              )}
            </div>

            {!flipped && (
              <div className="mt-auto pt-4 text-center text-xs text-muted">
                Tocca o premi <kbd className="rounded bg-surface-2 px-1">Spazio</kbd> per girare
              </div>
            )}
          </div>
        </Card>

        {flipped ? (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => grade(g)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg border px-2 py-3 text-sm font-semibold transition active:scale-95",
                  GRADE_META[g].cls,
                )}
              >
                <span className="text-xs opacity-70">{GRADE_META[g].key}</span>
                <span>{GRADE_META[g].label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <Button className="w-full" onClick={() => setFlipped(true)}>
              Mostra risposta
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ---- IDLE ---------------------------------------------------------------
  const nothingToDo = counts.due === 0 && counts.newCards === 0;
  return (
    <div>
      <PageHeader
        title="Ripasso"
        subtitle="Ripetizione dilazionata (SM-2) — le carte in scadenza per oggi."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="In scadenza" value={counts.due} accent />
        <Stat label="Nuove" value={counts.newCards} />
        <Stat label="Totale vocaboli" value={entries.length} />
      </div>

      <Card className="mb-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium">Direzione</span>
          <Segmented
            options={DIRECTION_OPTS}
            value={settings.direction}
            onChange={(v) => updateSettings({ direction: v })}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium">
            Carte per sessione:{" "}
            <span className="tabular-nums text-accent">{settings.sessionSize}</span>
          </span>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={settings.sessionSize}
            onChange={(e) =>
              updateSettings({ sessionSize: Number(e.target.value) })
            }
            className="w-48 accent-accent"
          />
        </div>
      </Card>

      {nothingToDo ? (
        <EmptyState icon="✅" title="Tutto ripassato per oggi!">
          Non ci sono carte in scadenza. Puoi allenarti in anticipo o aggiungere
          nuovi vocaboli dalla sezione Sfoglia.
          <div className="mt-4">
            <Button onClick={() => startSession(true)}>Allena comunque</Button>
          </div>
        </EmptyState>
      ) : (
        <Button className="w-full py-3 text-base" onClick={() => startSession(false)}>
          Inizia la sessione →
        </Button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div
        className={cn(
          "text-2xl font-bold tabular-nums",
          accent && "text-accent",
        )}
      >
        {value}
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
