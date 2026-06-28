import { useRef, useState } from "react";
import type { DeckJson } from "@presentation-skill-pack/export";
import { listThemeNames } from "../render/themes.js";
import { downloadHtml, downloadPptx, downloadJson, parseDeckJson } from "../export/downloads.js";

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

  const setTheme = (t: string) => onChange({ ...deck, meta: { ...deck.meta, theme: t } });
  const setTitle = (t: string) => onChange({ ...deck, meta: { ...deck.meta, title: t } });

  const onImport = async (file: File) => {
    try {
      const deck = parseDeckJson(await file.text());
      onChange(deck);
      setStatus(`Loaded ${file.name}`);
    } catch (err) {
      setStatus(`Import failed: ${(err as Error).message}`);
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

      <div className="spacer" />

      <button className="btn" onClick={onLoadExample}>Example</button>
      <button className="btn" onClick={() => fileRef.current?.click()}>Import JSON</button>
      <button className="btn" onClick={() => downloadJson(deck)}>JSON</button>
      <button className="btn" onClick={() => downloadHtml(deck)}>HTML</button>
      <button className="btn btn-primary" disabled={busy} onClick={exportPptx}>
        {busy ? "…" : "Download .pptx"}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onImport(f);
          e.target.value = "";
        }}
      />

      {status && <span className="status muted small">{status}</span>}
    </header>
  );
}
