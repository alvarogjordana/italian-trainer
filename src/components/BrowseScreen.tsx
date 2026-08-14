"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { normalize } from "@/lib/normalize";
import { masteryState, type MasteryState } from "@/lib/srs";
import {
  WORD_TYPES,
  CEFR_LEVELS,
  isVerb,
  type Cefr,
  type VocabEntry,
  type WordType,
} from "@/lib/types";
import { SpeakerButton } from "./SpeakerButton";
import { EntryForm } from "./EntryForm";
import {
  Button,
  Card,
  CefrBadge,
  EmptyState,
  PageHeader,
  Spinner,
  TypeBadge,
} from "./ui";
import { cn } from "@/lib/cn";

const MASTERY_META: Record<MasteryState, { label: string; cls: string }> = {
  new: { label: "nuovo", cls: "bg-muted/20 text-muted" },
  learning: { label: "in corso", cls: "bg-warning/15 text-warning" },
  mastered: { label: "acquisito", cls: "bg-success/15 text-success" },
};

type TypeFilter = WordType | "all";
type CefrFilter = Cefr | "all";
type MasteryFilter = MasteryState | "all";

export function BrowseScreen() {
  const { hydrated, entries, seedEntries, progress, addEntry, updateEntry, deleteEntry } =
    useStore();

  const [q, setQ] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [cefr, setCefr] = useState<CefrFilter>("all");
  const [tag, setTag] = useState<string>("all");
  const [mastery, setMastery] = useState<MasteryFilter>("all");
  const [editing, setEditing] = useState<VocabEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<VocabEntry | null>(null);

  const seedIds = useMemo(() => new Set(seedEntries.map((e) => e.id)), [seedEntries]);

  const allTags = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.tags))).sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return entries.filter((e) => {
      if (type !== "all" && e.type !== type) return false;
      if (cefr !== "all" && e.cefr !== cefr) return false;
      if (tag !== "all" && !e.tags.includes(tag)) return false;
      if (mastery !== "all" && masteryState(progress[e.id]) !== mastery) return false;
      if (nq) {
        const hay = normalize(
          `${e.italian} ${e.spanish} ${e.english} ${e.tags.join(" ")}`,
        );
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [entries, q, type, cefr, tag, mastery, progress]);

  if (!hydrated) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Sfoglia"
        subtitle={`${entries.length} vocaboli · filtra, cerca, aggiungi e modifica`}
        right={<Button onClick={() => setCreating(true)}>+ Aggiungi</Button>}
      />

      <Card className="mb-4 space-y-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca in italiano, spagnolo o inglese…"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="flex flex-wrap gap-2">
          <FilterSelect value={type} onChange={(v) => setType(v as TypeFilter)} label="Tipo">
            <option value="all">Tutti i tipi</option>
            {WORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={cefr} onChange={(v) => setCefr(v as CefrFilter)} label="CEFR">
            <option value="all">Tutti i livelli</option>
            {CEFR_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={tag} onChange={(v) => setTag(v)} label="Tag">
            <option value="all">Tutti i temi</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={mastery}
            onChange={(v) => setMastery(v as MasteryFilter)}
            label="Stato"
          >
            <option value="all">Tutti gli stati</option>
            <option value="new">nuovo</option>
            <option value="learning">in corso</option>
            <option value="mastered">acquisito</option>
          </FilterSelect>
        </div>
      </Card>

      <div className="mb-3 text-sm text-muted">
        {filtered.length} risultati
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nessun vocabolo trovato">
          Prova a cambiare i filtri o la ricerca.
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {filtered.map((e) => {
            const state = masteryState(progress[e.id]);
            const isCustom = !seedIds.has(e.id);
            return (
              <li key={e.id}>
                <Card className="flex items-center gap-3 py-3">
                  <SpeakerButton text={e.italian} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{e.italian}</span>
                      {e.type === "noun" && e.gender && (
                        <span className="text-xs text-muted">
                          ({e.gender})
                        </span>
                      )}
                      {isVerb(e) && e.isIrregular && (
                        <span className="text-xs text-warning">irr.</span>
                      )}
                      {isCustom && (
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          mio
                        </span>
                      )}
                    </div>
                    <div className="truncate text-sm text-muted">
                      {e.spanish} · {e.english}
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    <TypeBadge type={e.type} />
                    <CefrBadge level={e.cefr} />
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        MASTERY_META[state].cls,
                      )}
                    >
                      {MASTERY_META[state].label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconBtn label="Modifica" onClick={() => setEditing(e)}>
                      ✎
                    </IconBtn>
                    <IconBtn label="Elimina" danger onClick={() => setConfirmDelete(e)}>
                      🗑
                    </IconBtn>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {(creating || editing) && (
        <Modal
          title={creating ? "Nuovo vocabolo" : "Modifica vocabolo"}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        >
          <EntryForm
            initial={editing ?? undefined}
            onSave={(entry) => {
              if (creating) addEntry(entry);
              else updateEntry(entry);
              setCreating(false);
              setEditing(null);
            }}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminare?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-muted">
            Vuoi eliminare <span className="font-semibold text-fg">{confirmDelete.italian}</span>?
            {seedIds.has(confirmDelete.id) &&
              " (Puoi ripristinare tutti i vocaboli di base reimportando o azzerando i dati.)"}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Annulla
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteEntry(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Elimina
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm outline-none focus:border-accent"
    >
      {children}
    </select>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm hover:bg-surface-2",
        danger ? "text-danger" : "text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="rounded-lg px-2 py-1 text-muted hover:text-fg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
