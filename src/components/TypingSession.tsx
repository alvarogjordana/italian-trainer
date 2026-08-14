"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import {
  buildQueue,
  buildCramQueue,
  cardFaces,
  type QueueCard,
} from "@/lib/session";
import { dueCounts } from "@/lib/stats";
import { matchesAny } from "@/lib/normalize";
import { charDiff } from "@/lib/diff";
import type { Direction } from "@/lib/types";
import { SpeakerButton } from "./SpeakerButton";
import {
  Button,
  Card,
  CefrBadge,
  PageHeader,
  Segmented,
  Spinner,
  TypeBadge,
} from "./ui";
import { cn } from "@/lib/cn";

type Phase = "idle" | "running" | "done";

const DIRECTION_OPTS: { value: Direction; label: string }[] = [
  { value: "it-es", label: "IT → ES" },
  { value: "es-it", label: "ES → IT" },
  { value: "mixed", label: "Misto" },
];

/** First accepted variant, used as the canonical spelling for the diff. */
function canonical(answer: string): string {
  const parts = answer.split(/[/,;]|\bo\b/).map((s) => s.trim()).filter(Boolean);
  return parts[0] ?? answer;
}

export function TypingSession() {
  const { hydrated, entries, progress, settings, gradeCard, updateSettings } =
    useStore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [queue, setQueue] = useState<QueueCard[]>([]);
  const [total, setTotal] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [tally, setTally] = useState({ correct: 0, wrong: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(
    () =>
      hydrated
        ? dueCounts(entries, progress, Date.now())
        : { due: 0, newCards: 0 },
    [hydrated, entries, progress],
  );

  const start = useCallback(
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
      setTally({ correct: 0, wrong: 0 });
      setValue("");
      setChecked(null);
      setPhase("running");
    },
    [entries, progress, settings.sessionSize, settings.direction],
  );

  const current = queue[0];
  const faces = current ? cardFaces(current) : null;

  const submit = useCallback(() => {
    if (!current || !faces || checked !== null) return;
    const ok = matchesAny(value, faces.answer);
    setChecked(ok);
    setTally((t) => ({
      correct: t.correct + (ok ? 1 : 0),
      wrong: t.wrong + (ok ? 0 : 1),
    }));
    gradeCard(current.entry.id, ok ? "good" : "again", "typing");
  }, [current, faces, value, checked, gradeCard]);

  const next = useCallback(() => {
    setQueue((q) => {
      const rest = q.slice(1);
      if (rest.length === 0) setPhase("done");
      return rest;
    });
    setValue("");
    setChecked(null);
  }, []);

  const exit = useCallback(() => {
    setPhase("idle");
    setQueue([]);
    setValue("");
    setChecked(null);
  }, []);

  // Focus input on each new card.
  useEffect(() => {
    if (phase === "running" && checked === null) inputRef.current?.focus();
  }, [phase, checked, current?.entry.id]);

  // Esc exits the session from anywhere in it.
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, exit]);

  if (!hydrated) return <Spinner />;

  if (phase === "done") {
    const done = tally.correct + tally.wrong;
    const pct = done === 0 ? 0 : Math.round((tally.correct / done) * 100);
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <div className="mb-2 text-5xl">⌨️</div>
          <h2 className="text-xl font-bold">Sessione completata!</h2>
          <div className="my-5 grid grid-cols-3 gap-2 text-sm">
            <MiniStat label="Corrette" value={tally.correct} cls="text-success" />
            <MiniStat label="Sbagliate" value={tally.wrong} cls="text-danger" />
            <MiniStat label="Precisione" value={`${pct}%`} cls="text-accent" />
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={() => start(false)}>Ancora</Button>
            <Button variant="outline" onClick={exit}>
              Fine
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "running" && current && faces) {
    const { entry } = current;
    const expected = canonical(faces.answer);
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
          >
            Esc
          </button>
        </div>

        <Card className="min-h-[16rem]">
          <div className="mb-4 flex items-center gap-2">
            <TypeBadge type={entry.type} />
            <CefrBadge level={entry.cefr} />
            <span className="ml-auto text-xs uppercase tracking-wide text-muted">
              scrivi in {faces.answerLang === "it" ? "italiano" : "español"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{faces.prompt}</span>
              {faces.promptLang === "it" && (
                <SpeakerButton text={entry.italian} size="lg" />
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (checked === null) submit();
              else next();
            }}
            className="mt-2"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={checked !== null}
              placeholder="La tua risposta…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={cn(
                "w-full rounded-lg border bg-surface-2 px-4 py-3 text-center text-lg outline-none transition-colors",
                checked === null && "border-border focus:border-accent",
                checked === true && "border-success text-success",
                checked === false && "border-danger",
              )}
            />

            {checked !== null && (
              <div className="mt-4 space-y-3">
                {checked ? (
                  <div className="flex items-center justify-center gap-2 text-success">
                    <span className="text-lg font-semibold">Corretto!</span>
                    {faces.answerLang === "it" && (
                      <SpeakerButton text={entry.italian} size="sm" />
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="text-sm text-muted">Risposta corretta:</div>
                    <div className="flex items-center justify-center gap-2">
                      <DiffView expected={expected} actual={value} />
                      {faces.answerLang === "it" && (
                        <SpeakerButton text={entry.italian} size="sm" />
                      )}
                    </div>
                    {value.trim() !== "" && (
                      <div className="text-xs text-muted">
                        hai scritto: <span className="line-through">{value}</span>
                      </div>
                    )}
                  </div>
                )}
                {entry.exampleIt && (
                  <div className="rounded-lg bg-surface-2 p-3 text-left text-sm">
                    <span className="italic">{entry.exampleIt}</span>
                    {entry.exampleEs && (
                      <div className="mt-1 text-muted">{entry.exampleEs}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              {checked === null ? (
                <Button type="submit" className="w-full">
                  Controlla (Invio)
                </Button>
              ) : (
                <Button type="submit" className="w-full">
                  {queue.length > 1 ? "Prossima (Invio)" : "Fine (Invio)"}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // IDLE
  return (
    <div>
      <PageHeader
        title="Scrittura"
        subtitle="Digita la traduzione. L'accento non conta; ti mostro gli errori lettera per lettera."
      />
      <div className="mb-5 grid grid-cols-3 gap-3">
        <MiniStat label="In scadenza" value={counts.due} cls="text-accent" />
        <MiniStat label="Nuove" value={counts.newCards} cls="text-fg" />
        <MiniStat label="Vocaboli" value={entries.length} cls="text-fg" />
      </div>
      <Card className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium">Direzione</span>
        <Segmented
          options={DIRECTION_OPTS}
          value={settings.direction}
          onChange={(v) => updateSettings({ direction: v })}
        />
      </Card>
      <div className="flex gap-2">
        <Button className="flex-1 py-3" onClick={() => start(false)}>
          Inizia →
        </Button>
        <Button variant="outline" onClick={() => start(true)}>
          Allena tutto
        </Button>
      </div>
    </div>
  );
}

function DiffView({ expected, actual }: { expected: string; actual: string }) {
  const ops = charDiff(expected, actual);
  return (
    <span className="text-xl font-semibold">
      {ops
        .filter((o) => o.type !== "extra")
        .map((o, i) => (
          <span
            key={i}
            className={cn(
              o.type === "equal" && "text-success",
              o.type === "missing" && "rounded bg-danger/25 text-danger underline",
            )}
          >
            {o.char}
          </span>
        ))}
    </span>
  );
}

function MiniStat({
  label,
  value,
  cls,
}: {
  label: string;
  value: number | string;
  cls?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <div className={cn("text-2xl font-bold tabular-nums", cls)}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
