import { writeFile } from "node:fs/promises";
import { renderDeck, renderDeckPptx, getBundledThemesDir } from "@presentation-skill-pack/render";
import type { ToolDefinition } from "../server.js";

function applyThemeOverride(rawJson: string, theme?: string): string {
  if (!theme) return rawJson;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawJson) as Record<string, unknown>;
  } catch (err) {
    throw new Error(`Invalid JSON: ${(err as Error).message}`);
  }
  const meta = (parsed["meta"] ?? {}) as Record<string, unknown>;
  meta["theme"] = theme;
  parsed["meta"] = meta;
  return JSON.stringify(parsed);
}

function slideCountOf(json: string): number {
  try {
    const deck = JSON.parse(json) as { slides?: unknown[] };
    return Array.isArray(deck.slides) ? deck.slides.length : 0;
  } catch {
    return 0;
  }
}

export const exportDeckTool: ToolDefinition = {
  name: "export_deck",
  description:
    "Export a presentation-skill-pack deck JSON spec to a native, editable PowerPoint (.pptx) file — opens directly in PowerPoint and Keynote, and imports into Google Slides. Also supports html. Writes to output_path when given, otherwise returns base64 bytes.",
  inputSchema: {
    type: "object",
    properties: {
      json: { type: "string", description: "Deck JSON string conforming to the deck schema" },
      format: {
        type: "string",
        enum: ["pptx", "html"],
        description: "Output format (default: pptx)",
      },
      theme: { type: "string", description: "Theme name to apply (overrides meta.theme in the deck)" },
      output_path: { type: "string", description: "Path to write the exported file" },
    },
    required: ["json"],
  },
  handler: async (input: Record<string, unknown>) => {
    const rawJson = input["json"] as string;
    const format = ((input["format"] as string | undefined) ?? "pptx").toLowerCase();
    const theme = input["theme"] as string | undefined;
    const outputPath = input["output_path"] as string | undefined;

    if (format !== "pptx" && format !== "html") {
      throw new Error(`Unknown format "${format}" (expected pptx | html)`);
    }

    const deckJson = applyThemeOverride(rawJson, theme);
    const warnings: string[] = [];
    const slide_count = slideCountOf(deckJson);

    if (format === "html") {
      const html = await renderDeck(deckJson, { themesDir: getBundledThemesDir() });
      const result: { format: string; slide_count: number; path?: string; html?: string } = {
        format,
        slide_count,
      };
      if (outputPath) {
        await writeFile(outputPath, html, "utf-8");
        result.path = outputPath;
      } else {
        result.html = html;
      }
      return result;
    }

    const buffer = await renderDeckPptx(deckJson, {
      onWarn: (msg) => warnings.push(msg),
    });

    const result: {
      format: string;
      slide_count: number;
      byte_length: number;
      warnings: string[];
      path?: string;
      bytes_base64?: string;
    } = {
      format,
      slide_count,
      byte_length: buffer.byteLength,
      warnings,
    };

    if (outputPath) {
      await writeFile(outputPath, buffer);
      result.path = outputPath;
    } else {
      result.bytes_base64 = buffer.toString("base64");
    }

    return result;
  },
};
