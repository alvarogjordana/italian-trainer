"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { exportJson, importJson } from "@/lib/storage";
import { Button, Card, PageHeader, Spinner } from "./ui";

export function DataScreen() {
  const { hydrated, exportData, importAll, resetProgress, entries, reviews } =
    useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) return <Spinner />;

  const download = () => {
    const json = exportJson(exportData);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `italiano-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: "Backup scaricato." });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson(exportData));
      setMessage({ ok: true, text: "Copiato negli appunti." });
    } catch {
      setMessage({ ok: false, text: "Impossibile copiare." });
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importJson(String(reader.result ?? ""));
      if (result.ok && result.data) {
        importAll(result.data);
        setMessage({ ok: true, text: "Dati importati correttamente." });
      } else {
        setMessage({ ok: false, text: result.error ?? "Import non riuscito." });
      }
    };
    reader.onerror = () =>
      setMessage({ ok: false, text: "Impossibile leggere il file." });
    reader.readAsText(file);
  };

  const customCount = exportData.customEntries.length;
  const editedCount = Object.keys(exportData.editedSeedEntries).length;
  const deletedCount = exportData.deletedSeedIds.length;
  const progressCount = Object.keys(exportData.progress).length;

  return (
    <div>
      <PageHeader
        title="Dati"
        subtitle="Backup ed esportazione. localStorage è fragile: esporta spesso."
      />

      {message && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            message.ok
              ? "bg-success/15 text-success"
              : "bg-danger/15 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Mini label="Vocaboli totali" value={entries.length} />
        <Mini label="Vocaboli miei" value={customCount} />
        <Mini label="Con progressi" value={progressCount} />
        <Mini label="Ripassi registrati" value={reviews.length} />
      </div>

      <Card className="mb-4">
        <h3 className="mb-1 font-semibold">Esporta</h3>
        <p className="mb-3 text-sm text-muted">
          Scarica tutti i tuoi dati (progressi, vocaboli personalizzati,
          impostazioni) come file JSON.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={download}>⬇ Scarica JSON</Button>
          <Button variant="outline" onClick={copy}>
            Copia negli appunti
          </Button>
        </div>
      </Card>

      <Card className="mb-4">
        <h3 className="mb-1 font-semibold">Importa</h3>
        <p className="mb-3 text-sm text-muted">
          Sostituisci i dati attuali con un backup. I dati vengono validati
          prima di essere caricati.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          ⬆ Carica file JSON
        </Button>
      </Card>

      <Card className="border-danger/30">
        <h3 className="mb-1 font-semibold text-danger">Zona pericolosa</h3>
        <p className="mb-3 text-sm text-muted">
          Azzera tutti i progressi di ripetizione e lo storico ({progressCount}{" "}
          carte, {reviews.length} ripassi). I vocaboli personalizzati (
          {customCount}), le modifiche ({editedCount}) e le eliminazioni (
          {deletedCount}) restano.
        </p>
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">Sei sicuro?</span>
            <Button
              variant="danger"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
                setMessage({ ok: true, text: "Progressi azzerati." });
              }}
            >
              Sì, azzera
            </Button>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Annulla
            </Button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Azzera progressi
          </Button>
        )}
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
