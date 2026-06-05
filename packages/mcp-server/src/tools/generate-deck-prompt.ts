import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
import { loadTheme } from "@presentation-skill-pack/core";
import { getBundledThemesDir } from "@presentation-skill-pack/render";
import type { ToolDefinition } from "../server.js";

function getCoreRoot(): string {
  const require = createRequire(import.meta.url);
  const coreMain = require.resolve("@presentation-skill-pack/core");
  // coreMain points to dist/index.js; core root is two levels up from dist/
  return dirname(dirname(coreMain));
}

export const generateDeckPromptTool: ToolDefinition = {
  name: "generate_deck_prompt",
  description:
    "Build a system prompt with the active theme's palette and the deck schema reference, for an agent to produce a deck JSON spec.",
  inputSchema: {
    type: "object",
    properties: {
      theme: { type: "string", description: "Theme name to use (default: default-tech)" },
      intent: { type: "string", description: "What the deck should argue or show" }
    }
  },
  handler: async (input: Record<string, unknown>) => {
    const themeName = (input["theme"] as string | undefined) ?? "default-tech";
    const intent = (input["intent"] as string | undefined) ?? "";

    const coreRoot = getCoreRoot();
    const themesDir = getBundledThemesDir();

    const [theme, skill, deckSchemaReference] = await Promise.all([
      loadTheme(themeName, { themesDir }),
      readFile(join(coreRoot, "SKILL.md"), "utf-8"),
      readFile(join(coreRoot, "references", "deck-schema.md"), "utf-8")
    ]);

    return {
      theme: themeName,
      intent,
      skill,
      deck_schema_reference: deckSchemaReference,
      palette: theme.palette as unknown as Record<string, string>,
      typography: theme.typography
    };
  }
};
