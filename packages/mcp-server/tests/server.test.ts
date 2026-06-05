import { describe, it, expect } from "vitest";
import { auditDeckTool } from "../src/tools/audit-deck.js";
import { applyThemeTool } from "../src/tools/apply-theme.js";
import { listThemesTool } from "../src/tools/list-themes.js";
import { generateDeckPromptTool } from "../src/tools/generate-deck-prompt.js";

const MINIMAL_VALID_DECK = {
  type: "deck",
  meta: { title: "Test Deck", theme: "default-tech" },
  slides: [
    { layout: "title", heading: "Hello World", lead: "A minimal deck for testing." },
    { layout: "closing", heading: "Thank you" }
  ]
};

describe("audit_deck", () => {
  it("returns valid=true for a minimal valid deck", async () => {
    const result = (await auditDeckTool.handler({
      json: JSON.stringify(MINIMAL_VALID_DECK)
    })) as { valid: boolean; issues: unknown[]; slide_count: number };

    expect(result.valid).toBe(true);
    expect(result.slide_count).toBe(2);
  });

  it("returns valid=false for empty object {}", async () => {
    const result = (await auditDeckTool.handler({
      json: JSON.stringify({})
    })) as { valid: boolean; issues: Array<{ severity: string; message: string }> };

    expect(result.valid).toBe(false);
    const errors = result.issues.filter((i) => i.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("warns when deck has fewer than 2 slides", async () => {
    const deck = {
      type: "deck",
      slides: [{ layout: "title", heading: "Only slide" }]
    };
    const result = (await auditDeckTool.handler({
      json: JSON.stringify(deck)
    })) as { issues: Array<{ severity: string; message: string }> };

    const warnings = result.issues.filter((i) => i.severity === "warning");
    expect(warnings.some((w) => w.message.toLowerCase().includes("fewer than 2"))).toBe(true);
  });
});

describe("apply_theme", () => {
  it("correctly swaps meta.theme", async () => {
    const original = JSON.stringify(MINIMAL_VALID_DECK);
    const result = (await applyThemeTool.handler({
      json: original,
      target_theme: "corporate"
    })) as { json: string };

    const parsed = JSON.parse(result.json) as { meta: { theme: string }; slides: unknown[] };
    expect(parsed.meta.theme).toBe("corporate");
    expect(parsed.slides).toHaveLength(2);
  });

  it("adds meta if not present", async () => {
    const deck = { type: "deck", slides: [{ layout: "title", heading: "Hi" }] };
    const result = (await applyThemeTool.handler({
      json: JSON.stringify(deck),
      target_theme: "playful"
    })) as { json: string };

    const parsed = JSON.parse(result.json) as { meta: { theme: string } };
    expect(parsed.meta.theme).toBe("playful");
  });
});

describe("list_themes", () => {
  it("returns an array with at least one theme", async () => {
    const result = (await listThemesTool.handler({})) as {
      themes: Array<{ name: string; version: string }>;
    };
    expect(result.themes.length).toBeGreaterThan(0);
  });

  it("includes default-tech theme", async () => {
    const result = (await listThemesTool.handler({})) as {
      themes: Array<{ name: string }>;
    };
    const names = result.themes.map((t) => t.name);
    expect(names).toContain("default-tech");
  });
});

describe("generate_deck_prompt", () => {
  it("returns a non-empty skill string", async () => {
    const result = (await generateDeckPromptTool.handler({})) as {
      skill: string;
      deck_schema_reference: string;
      palette: Record<string, string>;
      typography: object;
    };

    expect(typeof result.skill).toBe("string");
    expect(result.skill.length).toBeGreaterThan(0);
  });

  it("returns palette and typography for default-tech", async () => {
    const result = (await generateDeckPromptTool.handler({
      theme: "default-tech",
      intent: "Show quarterly results"
    })) as {
      theme: string;
      intent: string;
      palette: Record<string, string>;
      typography: object;
    };

    expect(result.theme).toBe("default-tech");
    expect(result.intent).toBe("Show quarterly results");
    expect(result.palette).toHaveProperty("bg");
    expect(result.palette).toHaveProperty("accent");
    expect(result.typography).toHaveProperty("headingFont");
  });
});
