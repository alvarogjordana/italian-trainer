"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  accuracyOverDays,
  currentStreak,
  dueCounts,
  masteryByType,
  overallAccuracy,
  weakestEntries,
} from "@/lib/stats";
import { WORD_TYPES, type WordType } from "@/lib/types";
import { SpeakerButton } from "./SpeakerButton";
import { Card, EmptyState, PageHeader, Spinner } from "./ui";
import { cn } from "@/lib/cn";

const TYPE_LABELS: Record<WordType, string> = {
  noun: "sostantivi",
  verb: "verbi",
  adjective: "aggettivi",
  adverb: "avverbi",
  expression: "espressioni",
  conjunction: "congiunzioni",
  preposition: "preposizioni",
};

export function StatsScreen() {
  const { hydrated, entries, progress, reviews } = useStore();

  const data = useMemo(() => {
    const now = Date.now();
    return {
      counts: dueCounts(entries, progress, now),
      streak: currentStreak(reviews, now),
      daily: accuracyOverDays(reviews, now, 30),
      overall: overallAccuracy(reviews, now, 30),
      mastery: masteryByType(entries, progress),
      weakest: weakestEntries(entries, progress, 20),
      reviewedTotal: reviews.length,
    };
  }, [entries, progress, reviews]);

  if (!hydrated) return <Spinner />;

  const maxDay = Math.max(1, ...data.daily.map((d) => d.total));

  return (
    <div>
      <PageHeader title="Statistiche" subtitle="I tuoi progressi e i punti deboli." />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="In scadenza oggi" value={data.counts.due} accent />
        <Kpi label="Serie 🔥" value={`${data.streak} gg`} />
        <Kpi
          label="Precisione 30 gg"
          value={
            data.overall.total === 0
              ? "—"
              : `${Math.round(data.overall.accuracy * 100)}%`
          }
        />
        <Kpi label="Ripassi totali" value={data.reviewedTotal} />
      </div>

      {/* 30-day accuracy */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Attività ultimi 30 giorni</h3>
          <span className="text-xs text-muted">
            {data.overall.correct}/{data.overall.total} corrette
          </span>
        </div>
        {data.overall.total === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Nessun ripasso ancora. Inizia una sessione per vedere i tuoi dati qui.
          </p>
        ) : (
          <div className="flex h-28 items-end gap-[3px]">
            {data.daily.map((d) => {
              const h = (d.total / maxDay) * 100;
              const acc = d.accuracy;
              const color =
                d.total === 0
                  ? "bg-surface-2"
                  : acc >= 0.8
                    ? "bg-success"
                    : acc >= 0.5
                      ? "bg-warning"
                      : "bg-danger";
              return (
                <div
                  key={d.date}
                  className="group relative flex-1"
                  style={{ height: "100%" }}
                >
                  <div className="flex h-full items-end">
                    <div
                      className={cn("w-full rounded-sm", color)}
                      style={{ height: `${Math.max(d.total === 0 ? 4 : 8, h)}%` }}
                    />
                  </div>
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-surface-2 px-2 py-1 text-[10px] shadow group-hover:block">
                    {d.date.slice(5)} · {d.correct}/{d.total}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Mastery by type */}
      <Card className="mb-4">
        <h3 className="mb-3 font-semibold">Padronanza per tipo</h3>
        <div className="space-y-2.5">
          {WORD_TYPES.map((t) => {
            const m = data.mastery[t];
            const total = m.new + m.learning + m.mastered;
            if (total === 0) return null;
            return (
              <div key={t}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="capitalize text-muted">{TYPE_LABELS[t]}</span>
                  <span className="tabular-nums text-muted">
                    {m.mastered}/{total} acquisiti
                  </span>
                </div>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <Bar n={m.mastered} total={total} cls="bg-success" />
                  <Bar n={m.learning} total={total} cls="bg-warning" />
                  <Bar n={m.new} total={total} cls="bg-muted/30" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          <Legend cls="bg-success" label="acquisito" />
          <Legend cls="bg-warning" label="in corso" />
          <Legend cls="bg-muted/30" label="nuovo" />
        </div>
      </Card>

      {/* Weakest 20 */}
      <Card>
        <h3 className="mb-3 font-semibold">20 vocaboli più deboli</h3>
        {data.weakest.length === 0 ? (
          <EmptyState icon="💪" title="Nessun punto debole (ancora)">
            Man mano che ripassi, qui appariranno le parole che ti danno più
            filo da torcere.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {data.weakest.map(({ entry, progress: p }) => (
              <li key={entry.id} className="flex items-center gap-3 py-2">
                <SpeakerButton text={entry.italian} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{entry.italian}</div>
                  <div className="truncate text-xs text-muted">
                    {entry.spanish}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs text-muted">
                  <div>
                    {p.lapses} {p.lapses === 1 ? "errore" : "errori"}
                  </div>
                  <div>facilità {p.easeFactor.toFixed(1)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Kpi({
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
      <div className={cn("text-2xl font-bold tabular-nums", accent && "text-accent")}>
        {value}
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function Bar({ n, total, cls }: { n: number; total: number; cls: string }) {
  if (n === 0) return null;
  return <div className={cls} style={{ width: `${(n / total) * 100}%` }} />;
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", cls)} />
      {label}
    </span>
  );
}
