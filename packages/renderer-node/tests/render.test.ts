import { describe, it, expect } from "vitest";
import { renderDeck } from "../src/index.js";

const MINIMAL_DECK = JSON.stringify({
  type: "deck",
  meta: { title: "Test Deck", description: "A test." },
  slides: [
    { layout: "title", heading: "Hello World" },
    { layout: "closing", heading: "Thank You" },
  ],
});

const DEFAULT_TECH_DECK = JSON.stringify({
  type: "deck",
  meta: { title: "Tech Deck", theme: "default-tech" },
  slides: [{ layout: "title", heading: "Tech" }],
});

const INVALID_JSON = "{ not valid json }";

const INVALID_DECK = JSON.stringify({
  type: "deck",
  slides: [{ layout: "unknown-layout" }],
});

describe("renderDeck", () => {
  it("produces valid HTML for a minimal deck with title + closing slides", async () => {
    const html = await renderDeck(MINIMAL_DECK);
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toContain("Hello World");
    expect(html).toContain('class="slide');
    expect(html).toContain("fonts.googleapis.com");
  });

  it("throws with a message containing 'invalid' for invalid JSON", async () => {
    await expect(renderDeck(INVALID_JSON)).rejects.toThrow(/invalid/i);
  });

  it("throws with a message containing 'invalid' for a deck that fails schema validation", async () => {
    await expect(renderDeck(INVALID_DECK)).rejects.toThrow(/invalid/i);
  });

  it("produces HTML containing --accent CSS variable when using default-tech theme", async () => {
    const html = await renderDeck(DEFAULT_TECH_DECK);
    expect(html).toContain("--accent");
  });

  it("renders title layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [{ layout: "title", heading: "Title Slide", eyebrow: "Intro", lead: "Lead text" }],
    });
    await expect(renderDeck(deck)).resolves.toContain("Title Slide");
  });

  it("renders two-column layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [{ layout: "two-column", heading: "Two Columns", body: "Left side" }],
    });
    await expect(renderDeck(deck)).resolves.toContain("Two Columns");
  });

  it("renders feature-grid layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [
        {
          layout: "feature-grid",
          heading: "Features",
          columns: 3,
          cards: [
            { title: "Card A", body: "Body A" },
            { title: "Card B", body: "Body B" },
            { title: "Card C", body: "Body C" },
          ],
        },
      ],
    });
    await expect(renderDeck(deck)).resolves.toContain("Card A");
  });

  it("renders quote layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [{ layout: "quote", quote: "Less is more.", by: "Mies van der Rohe" }],
    });
    await expect(renderDeck(deck)).resolves.toContain("Less is more.");
  });

  it("renders data-table layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [
        {
          layout: "data-table",
          heading: "Table",
          columns: ["Name", "Value"],
          rows: [
            ["Alpha", "1"],
            ["Beta", "2"],
          ],
        },
      ],
    });
    const html = await renderDeck(deck);
    expect(html).toContain("Alpha");
    expect(html).toContain("<td>");
  });

  it("renders stat-row layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [
        {
          layout: "stat-row",
          heading: "Key Numbers",
          stats: [
            { value: "99%", label: "Uptime" },
            { value: "42ms", label: "Latency" },
          ],
        },
      ],
    });
    await expect(renderDeck(deck)).resolves.toContain("99%");
  });

  it("renders timeline layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [
        {
          layout: "timeline",
          heading: "Roadmap",
          steps: [
            { title: "Q1", body: "Launch" },
            { title: "Q2", body: "Grow" },
          ],
        },
      ],
    });
    await expect(renderDeck(deck)).resolves.toContain("Q1");
  });

  it("renders section layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [{ layout: "section", heading: "Chapter One", number: "01" }],
    });
    await expect(renderDeck(deck)).resolves.toContain("Chapter One");
  });

  it("renders closing layout without throwing", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [
        {
          layout: "closing",
          heading: "Get in Touch",
          lead: "We'd love to hear from you.",
          cta: { label: "Contact Us", href: "https://example.com" },
        },
      ],
    });
    const html = await renderDeck(deck);
    expect(html).toContain("Get in Touch");
    expect(html).toContain("Contact Us");
  });

  it("appends extraCss when provided", async () => {
    const deck = JSON.stringify({
      type: "deck",
      slides: [{ layout: "title", heading: "Styled" }],
    });
    const html = await renderDeck(deck, { extraCss: ".custom-rule { color: red; }" });
    expect(html).toContain(".custom-rule");
  });
});
