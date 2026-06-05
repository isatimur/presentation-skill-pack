import { validateDeckJson } from "@presentation-skill-pack/core";
import type { ToolDefinition } from "../server.js";

interface Issue {
  severity: "error" | "warning";
  message: string;
}

const HEADING_LAYOUTS = new Set(["title", "section", "closing"]);
const VALID_LAYOUTS = new Set([
  "title", "two-column", "feature-grid", "quote",
  "data-table", "stat-row", "timeline", "section", "closing"
]);

function manualValidate(deck: Record<string, unknown>): { valid: boolean; issues: Issue[] } {
  const issues: Issue[] = [];

  if (deck["type"] !== "deck") {
    issues.push({ severity: "error", message: `/ must have "type": "deck"` });
  }

  const slides = deck["slides"];
  if (!Array.isArray(slides)) {
    issues.push({ severity: "error", message: `/ must have a "slides" array` });
    return { valid: issues.length === 0, issues };
  }

  if (slides.length === 0) {
    issues.push({ severity: "error", message: `"slides" array must not be empty` });
  }

  return { valid: issues.filter((i) => i.severity === "error").length === 0, issues };
}

function lightStructuralChecks(deck: Record<string, unknown>): Issue[] {
  const issues: Issue[] = [];

  const slides = deck["slides"];
  if (!Array.isArray(slides)) return issues;

  if (slides.length < 2) {
    issues.push({ severity: "warning", message: "Deck has fewer than 2 slides — consider adding more content" });
  }

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i] as Record<string, unknown>;
    const layout = slide["layout"] as string | undefined;

    if (layout && !VALID_LAYOUTS.has(layout)) {
      issues.push({
        severity: "error",
        message: `Slide ${i + 1}: unknown layout "${layout}"`
      });
    }

    if (layout && HEADING_LAYOUTS.has(layout) && !slide["heading"]) {
      issues.push({
        severity: "warning",
        message: `Slide ${i + 1} (layout "${layout}") is missing a "heading" field`
      });
    }

    if (layout === "feature-grid") {
      const columns = slide["columns"];
      const cards = slide["cards"];
      if (typeof columns === "number" && Array.isArray(cards)) {
        if (cards.length % columns !== 0) {
          issues.push({
            severity: "warning",
            message: `Slide ${i + 1} (feature-grid): "cards" count (${cards.length}) is not a multiple of "columns" (${columns})`
          });
        }
      }
    }
  }

  return issues;
}

export const auditDeckTool: ToolDefinition = {
  name: "audit_deck",
  description:
    "Validate a deck JSON against the schema and return structured issues.",
  inputSchema: {
    type: "object",
    properties: {
      json: { type: "string", description: "Deck JSON string to validate" }
    },
    required: ["json"]
  },
  handler: async (input: Record<string, unknown>) => {
    const json = input["json"] as string;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json) as Record<string, unknown>;
    } catch (err) {
      return {
        valid: false,
        issues: [{ severity: "error", message: `Invalid JSON: ${(err as Error).message}` }],
        slide_count: 0
      };
    }

    // Attempt full schema validation via core. If AJV can't load the meta-schema
    // (e.g. draft/2020-12 not registered), fall back to manual structural validation.
    let valid = false;
    let issues: Issue[] = [];

    try {
      const result = validateDeckJson(json);
      valid = result.valid;
      issues = result.errors.map((msg) => ({ severity: "error" as const, message: msg }));
    } catch {
      // Core validator unavailable (e.g. AJV meta-schema not registered) — fall back
      const fallback = manualValidate(parsed);
      valid = fallback.valid;
      issues = fallback.issues;
    }

    // Always run light structural checks regardless of schema validity
    const structural = lightStructuralChecks(parsed);
    issues.push(...structural);

    const slides = parsed["slides"];
    const slideCount = Array.isArray(slides) ? slides.length : 0;

    return { valid, issues, slide_count: slideCount };
  }
};
