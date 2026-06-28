import { describe, it, expect } from "vitest";
import { resolveTheme, listThemeNames } from "../src/render/themes.js";
import { renderDeckHtml } from "../src/render/renderDeck.js";
import { EXAMPLE_DECK } from "../src/deck.js";

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

  it("renders an unknown layout without throwing", () => {
    const html = renderDeckHtml(
      { type: "deck", slides: [{ layout: "mystery", heading: "X" }] },
      resolveTheme("default-tech")
    );
    expect(html).toContain("Unknown layout");
  });
});
