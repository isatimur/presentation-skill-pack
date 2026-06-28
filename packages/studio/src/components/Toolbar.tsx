import { useRef, useState } from "react";
import type { DeckJson } from "@presentation-skill-pack/export";
import { listThemeNames } from "../render/themes.js";
import { downloadHtml, downloadPptx, downloadJson, parseDeckFile } from "../export/downloads.js";

export function Toolbar({
  deck,
  onChange,
  onLoadExample,
}: {
  deck: DeckJson;
  onChange: (next: DeckJson) => void;
  onLoadExample: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const themeNames = listThemeNames();
  const theme = deck.meta?.theme ?? "default-tech";

  const setMeta = (patch: Record<string, string>) =>
    onChange({ ...deck, meta: { ...deck.meta, ...patch } });
  const setTheme = (t: string) => setMeta({ theme: t });
  const setTitle = (t: string) => setMeta({ title: t });

  const onOpen = async (file: File) => {
    try {
      const opened = parseDeckFile(file.name, await file.text());
      onChange(opened);
      setStatus(`Opened ${file.name}`);
    } catch (err) {
      setStatus(`Open failed: ${(err as Error).message}`);
    }
  };

  const exportPptx = async () => {
    setBusy(true);
    setStatus("Building .pptx…");
    try {
      const { warnings } = await downloadPptx(deck);
      setStatus(warnings.length ? `Exported .pptx (${warnings.length} warning${warnings.length > 1 ? "s" : ""})` : "Exported .pptx");
    } catch (err) {
      setStatus(`Export failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="toolbar">
      <div className="brand">
        <strong>Studio</strong>
        <span className="muted small">presentation-skill-pack</span>
      </div>

      <input
        className="text-input title-input"
        value={deck.meta?.title ?? ""}
        placeholder="Deck title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="inline-field">
        <span className="muted small">Theme</span>
        <select className="text-input" value={theme} onChange={(e) => setTheme(e.target.value)}>
          {themeNames.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <details className="deck-details">
        <summary className="btn btn-sm">Details</summary>
        <div className="deck-details-body">
          <input
            className="text-input"
            value={deck.meta?.company ?? ""}
            placeholder="Company"
            onChange={(e) => setMeta({ company: e.target.value })}
          />
          <input
            className="text-input"
            value={deck.meta?.description ?? ""}
            placeholder="Description"
            onChange={(e) => setMeta({ description: e.target.value })}
          />
        </div>
      </details>

      <div className="spacer" />

      <button className="btn" onClick={onLoadExample}>Example</button>
      <button className="btn" onClick={() => fileRef.current?.click()} title="Open a deck .html or .json">Open</button>
      <button className="btn" onClick={() => downloadJson(deck)}>JSON</button>
      <button className="btn" onClick={() => downloadHtml(deck)}>HTML</button>
      <button className="btn btn-primary" disabled={busy} onClick={exportPptx}>
        {busy ? "…" : "Download .pptx"}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".html,.htm,.json,application/json,text/html"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onOpen(f);
          e.target.value = "";
        }}
      />

      {status && <span className="status muted small">{status}</span>}
    </header>
  );
}
