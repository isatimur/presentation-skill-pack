import { deckToPptxBlob } from "@presentation-skill-pack/export";
import type { DeckJson } from "@presentation-skill-pack/export";
import { resolveTheme } from "../render/themes.js";
import { renderDeckHtml } from "../render/renderDeck.js";

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeName(deck: DeckJson, ext: string): string {
  const base = (deck.meta?.title ?? deck.meta?.company ?? "deck")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "deck";
  return `${base}.${ext}`;
}

function themeName(deck: DeckJson): string {
  return deck.meta?.theme ?? "default-tech";
}

export interface PptxDownloadResult {
  warnings: string[];
}

export async function downloadPptx(deck: DeckJson): Promise<PptxDownloadResult> {
  const warnings: string[] = [];
  const theme = resolveTheme(themeName(deck));
  const blob = await deckToPptxBlob(deck, theme, { onWarn: (m) => warnings.push(m) });
  triggerDownload(blob, safeName(deck, "pptx"));
  return { warnings };
}

export function downloadHtml(deck: DeckJson): void {
  const theme = resolveTheme(themeName(deck));
  const html = renderDeckHtml(deck, theme);
  triggerDownload(new Blob([html], { type: "text/html" }), safeName(deck, "html"));
}

export function downloadJson(deck: DeckJson): void {
  triggerDownload(
    new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" }),
    safeName(deck, "json")
  );
}

export function parseDeckJson(text: string): DeckJson {
  const parsed = JSON.parse(text) as DeckJson;
  if (parsed?.type !== "deck" || !Array.isArray(parsed.slides)) {
    throw new Error('Not a valid deck: expected { "type": "deck", "slides": [...] }');
  }
  return parsed;
}
