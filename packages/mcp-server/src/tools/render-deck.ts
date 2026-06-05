import { writeFile } from "node:fs/promises";
import { renderDeck, getBundledThemesDir } from "@presentation-skill-pack/render";
import type { ToolDefinition } from "../server.js";

export const renderDeckTool: ToolDefinition = {
  name: "render_deck",
  description:
    "Render a presentation-skill-pack deck JSON spec to a self-contained HTML slide deck. Returns the HTML string and optionally writes to a file.",
  inputSchema: {
    type: "object",
    properties: {
      json: { type: "string", description: "Deck JSON string conforming to the deck schema" },
      theme: { type: "string", description: "Theme name to apply (overrides meta.theme in the deck)" },
      output_path: { type: "string", description: "Absolute or relative path to write the rendered HTML file" }
    },
    required: ["json"]
  },
  handler: async (input: Record<string, unknown>) => {
    const rawJson = input["json"] as string;
    const theme = input["theme"] as string | undefined;
    const outputPath = input["output_path"] as string | undefined;

    let deckJson = rawJson;
    if (theme) {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawJson) as Record<string, unknown>;
      } catch (err) {
        throw new Error(`Invalid JSON: ${(err as Error).message}`);
      }
      const meta = (parsed["meta"] ?? {}) as Record<string, unknown>;
      meta["theme"] = theme;
      parsed["meta"] = meta;
      deckJson = JSON.stringify(parsed);
    }

    const html = await renderDeck(deckJson, { themesDir: getBundledThemesDir() });

    let deck: { slides?: unknown[] };
    try {
      deck = JSON.parse(deckJson) as { slides?: unknown[] };
    } catch {
      deck = {};
    }
    const slideCount = Array.isArray(deck.slides) ? deck.slides.length : 0;

    const result: { html: string; path?: string; slide_count: number } = {
      html,
      slide_count: slideCount
    };

    if (outputPath) {
      await writeFile(outputPath, html, "utf-8");
      result.path = outputPath;
    }

    return result;
  }
};
