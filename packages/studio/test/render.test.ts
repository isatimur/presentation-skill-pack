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
    expect(html).not.toContain("javascript:alert");
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

  it("renders an unknown layout without throwing", () => {
    const html = renderDeckHtml(
      { type: "deck", slides: [{ layout: "mystery", heading: "X" }] },
      resolveTheme("default-tech")
    );
    expect(html).toContain("Unknown layout");
  });
});
