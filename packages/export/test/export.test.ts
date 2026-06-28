import { describe, it, expect } from "vitest";
import type { ResolvedTheme } from "@presentation-skill-pack/core";
import {
  buildPptx,
  deckToPptxArrayBuffer,
  deckToPptxBuffer,
  type DeckJson,
} from "../src/index.js";

const theme: ResolvedTheme = {
  name: "test",
  version: "1.0.0",
  manifest: { name: "test", version: "1.0.0" },
  palette: {
    bg: "#0e0e12",
    bg2: "#16161d",
    text: "#f4f4f5",
    muted: "#a1a1aa",
    accent: "#7c3aed",
    accent2: "#22d3ee",
    cardBg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
  },
  typography: {
    headingFont: "'Montserrat', system-ui, sans-serif",
    bodyFont: "'Open Sans', system-ui, sans-serif",
    headingWeight: 800,
    googleFonts: [],
  },
  geometry: { radius: "18px", slideWidth: "1280px" },
};

const fullDeck: DeckJson = {
  type: "deck",
  meta: { title: "Test Deck", company: "Acme", theme: "test" },
  slides: [
    { layout: "title", eyebrow: "Q3 2026", heading: "All-hands", lead: "Where we are." },
    { layout: "section", number: "01", eyebrow: "Part one", heading: "Context" },
    { layout: "two-column", heading: "Split", body: "Left text.", image: "https://x/y.png", imageAlt: "Diagram" },
    {
      layout: "feature-grid",
      heading: "Pillars",
      columns: 3,
      cards: [
        { icon: "fa-bolt", title: "Fast", body: "Speed." },
        { title: "Safe", body: "Secure." },
        { title: "Simple", body: "Easy." },
      ],
    },
    { layout: "data-table", heading: "Numbers", columns: ["Metric", "Value"], rows: [["MRR", "$10k"], ["Users", "1,200"]] },
    { layout: "stat-row", heading: "KPIs", stats: [{ value: "98%", label: "Uptime" }, { value: "3x", label: "Growth" }] },
    { layout: "timeline", heading: "Roadmap", steps: [{ title: "Now", body: "Build." }, { title: "Next", body: "Ship." }] },
    { layout: "quote", quote: "Make it work.", by: "Kent Beck" },
    { layout: "closing", heading: "Thanks", lead: "Questions?", cta: { label: "Get started", href: "https://acme.com" } },
  ],
};

function isZip(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b; // "PK"
}

describe("deckToPptx", () => {
  it("builds one slide per deck slide across all 9 layouts", async () => {
    const result = await buildPptx(fullDeck, theme);
    expect(result.slideCount).toBe(fullDeck.slides.length);
  });

  it("produces a valid (zip-signed) PPTX ArrayBuffer", async () => {
    const buf = await deckToPptxArrayBuffer(fullDeck, theme);
    const bytes = new Uint8Array(buf);
    expect(bytes.byteLength).toBeGreaterThan(1000);
    expect(isZip(bytes)).toBe(true);
  });

  it("produces a Node Buffer too", async () => {
    const buf = await deckToPptxBuffer(fullDeck, theme);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(isZip(buf)).toBe(true);
  });

  it("warns (no silent drop) when a remote image can't be embedded", async () => {
    const result = await buildPptx(fullDeck, theme);
    expect(result.warnings.some((w) => w.includes("Image not embedded"))).toBe(true);
  });

  it("warns on an unknown layout but still renders", async () => {
    const deck: DeckJson = {
      type: "deck",
      slides: [{ layout: "mystery", heading: "Hi" }],
    };
    const result = await buildPptx(deck, theme);
    expect(result.slideCount).toBe(1);
    expect(result.warnings.some((w) => w.includes("Unknown layout"))).toBe(true);
  });
});
