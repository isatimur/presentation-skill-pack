import { describe, it, expect } from "vitest";
import { resolveTheme, listThemeNames } from "../src/render/themes.js";
import { renderDeckHtml } from "../src/render/renderDeck.js";
import { extractDeckFromHtml } from "../src/export/downloads.js";
import { EXAMPLE_DECK } from "../src/deck.js";
import type { DeckJson } from "@presentation-skill-pack/export";

describe("theme registry", () => {
  it("bundles the core + themes-package manifests", () => {
    const names = listThemeNames();
    expect(names).toContain("default-tech");
    expect(names).toContain("corporate");
  });

  it("resolves default-tech palette", () => {
    expect(resolveTheme("default-tech").palette.bg).toBe("#0e0e12");
  });

  it("resolves the extends chain (corporate overrides bg, inherits the rest)", () => {
    const corporate = resolveTheme("corporate");
    expect(corporate.palette.bg).toBe("#ffffff");
    // Inherited default typography keys still present.
    expect(corporate.typography.googleFonts.length).toBeGreaterThan(0);
  });

  it("falls back to default-tech for unknown names", () => {
    expect(resolveTheme("does-not-exist").palette.bg).toBe("#0e0e12");
  });
});

describe("browser renderDeckHtml", () => {
  it("renders one <section> per slide with the heading text and theme tokens", () => {
    const html = renderDeckHtml(EXAMPLE_DECK, resolveTheme("default-tech"));
    const sectionCount = (html.match(/<section/g) ?? []).length;
    expect(sectionCount).toBe(EXAMPLE_DECK.slides.length);
    expect(html).toContain("Acme All-Hands");
    expect(html).toContain("--accent: #7c3aed");
    expect(html).toContain("<!doctype html>");
  });

  it("neutralizes javascript: in cta.href and image (XSS defense in depth)", () => {
    const html = renderDeckHtml(
      {
        type: "deck",
        slides: [
          { layout: "closing", heading: "Hi", cta: { label: "Go", href: "javascript:alert(1)" } },
          { layout: "two-column", heading: "Img", image: "javascript:alert(2)", imageAlt: "x" },
        ],
      },
      resolveTheme("default-tech")
    );
    // Neutralized in the rendered markup; the embedded source JSON may still hold
    // the original string as inert, non-executable data.
    expect(html).not.toContain('href="javascript');
    expect(html).not.toContain('src="javascript');
    expect(html).toContain('href="#"');
  });

  it("preserves safe links and inline images", () => {
    const html = renderDeckHtml(
      {
        type: "deck",
        slides: [{ layout: "closing", heading: "Hi", cta: { label: "Go", href: "https://acme.com/x" } }],
      },
      resolveTheme("default-tech")
    );
    // Mustache escapes "/" → &#x2F;, so assert on the host and that it wasn't blocked to "#".
    expect(html).toContain("acme.com");
    expect(html).not.toContain('href="#"');
  });

  it("embeds the source deck and round-trips it via extractDeckFromHtml", () => {
    const deck: DeckJson = {
      type: "deck",
      meta: { title: "RT", company: "Acme", description: "desc", theme: "default-tech" },
      slides: [{ layout: "data-table", eyebrow: "KPIs", heading: "H", columns: ["A"], rows: [["1"]] }],
    };
    const html = renderDeckHtml(deck, resolveTheme("default-tech"));
    expect(extractDeckFromHtml(html)).toEqual(deck);
  });

  it("renders the data-table eyebrow (editor/preview consistency)", () => {
    const html = renderDeckHtml(
      { type: "deck", slides: [{ layout: "data-table", eyebrow: "Q3 KPIs", heading: "T", columns: ["A"], rows: [["1"]] }] },
      resolveTheme("default-tech")
    );
    expect(html).toContain("Q3 KPIs");
  });

  it("attribution CSS matches the canonical renderer (hover + print)", () => {
    const html = renderDeckHtml(EXAMPLE_DECK, resolveTheme("default-tech"));
    expect(html).toContain("@media print");
    expect(html).toContain(".psp-attribution a:hover");
  });

  it("renders an unknown layout without throwing", () => {
    const html = renderDeckHtml(
      { type: "deck", slides: [{ layout: "mystery", heading: "X" }] },
      resolveTheme("default-tech")
    );
    expect(html).toContain("Unknown layout");
  });
});
