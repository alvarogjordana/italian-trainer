"use client";

import { useState } from "react";
import { makeCustomId } from "@/lib/entries";
import {
  WORD_TYPES,
  CEFR_LEVELS,
  isVerb,
  type Cefr,
  type Gender,
  type NonVerbEntry,
  type VocabEntry,
  type WordType,
} from "@/lib/types";
import { Button } from "./ui";

// Verbs need full conjugation tables, so the form edits non-verb fields only;
// when editing a seed verb its conjugations are preserved untouched.
const FORM_TYPES: WordType[] = WORD_TYPES.filter((t) => t !== "verb");

interface Props {
  initial?: VocabEntry;
  onSave: (entry: VocabEntry) => void;
  onCancel: () => void;
}

export function EntryForm({ initial, onSave, onCancel }: Props) {
  const editingVerb = initial ? isVerb(initial) : false;
  const [italian, setItalian] = useState(initial?.italian ?? "");
  const [spanish, setSpanish] = useState(initial?.spanish ?? "");
  const [english, setEnglish] = useState(initial?.english ?? "");
  const [type, setType] = useState<WordType>(initial?.type ?? "noun");
  const [gender, setGender] = useState<Gender | "">(initial?.gender ?? "");
  const [plural, setPlural] = useState(initial?.plural ?? "");
  const [cefr, setCefr] = useState<Cefr>(initial?.cefr ?? "A1");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [exampleIt, setExampleIt] = useState(initial?.exampleIt ?? "");
  const [exampleEs, setExampleEs] = useState(initial?.exampleEs ?? "");
  const [error, setError] = useState("");

  const submit = () => {
    if (!italian.trim() || !spanish.trim() || !english.trim()) {
      setError("Italiano, spagnolo e inglese sono obbligatori.");
      return;
    }
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const base = {
      id: initial?.id ?? makeCustomId(Date.now()),
      italian: italian.trim(),
      spanish: spanish.trim(),
      english: english.trim(),
      plural: plural.trim() || null,
      notes: notes.trim() || null,
      exampleIt: exampleIt.trim() || null,
      exampleEs: exampleEs.trim() || null,
      tags: parsedTags,
      cefr,
    };

    if (initial && isVerb(initial)) {
      // Preserve verb-only fields and conjugations.
      onSave({
        ...initial,
        ...base,
        type: "verb",
        gender: null,
      });
      return;
    }

    const entry: NonVerbEntry = {
      ...base,
      type: type as Exclude<WordType, "verb">,
      gender: type === "noun" && gender ? (gender as Gender) : null,
    };
    onSave(entry);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Italiano *">
          <input className={inputCls} value={italian} onChange={(e) => setItalian(e.target.value)} />
        </Field>
        <Field label="Spagnolo *">
          <input className={inputCls} value={spanish} onChange={(e) => setSpanish(e.target.value)} />
        </Field>
        <Field label="Inglese *">
          <input className={inputCls} value={english} onChange={(e) => setEnglish(e.target.value)} />
        </Field>
        <Field label="Tipo">
          <select
            className={inputCls}
            value={type}
            disabled={editingVerb}
            onChange={(e) => setType(e.target.value as WordType)}
          >
            {editingVerb && <option value="verb">verbo</option>}
            {FORM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        {type === "noun" && (
          <Field label="Genere">
            <select
              className={inputCls}
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | "")}
            >
              <option value="">—</option>
              <option value="m">maschile (m)</option>
              <option value="f">femminile (f)</option>
            </select>
          </Field>
        )}
        <Field label="Plurale">
          <input className={inputCls} value={plural} onChange={(e) => setPlural(e.target.value)} />
        </Field>
        <Field label="Livello CEFR">
          <select className={inputCls} value={cefr} onChange={(e) => setCefr(e.target.value as Cefr)}>
            {CEFR_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tag (separati da virgola)">
          <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>
      </div>
      <Field label="Esempio (IT)">
        <input className={inputCls} value={exampleIt} onChange={(e) => setExampleIt(e.target.value)} />
      </Field>
      <Field label="Esempio (ES)">
        <input className={inputCls} value={exampleEs} onChange={(e) => setExampleEs(e.target.value)} />
      </Field>
      <Field label="Note">
        <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button onClick={submit}>Salva</Button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
