import type { ToolDefinition } from "../server.js";

export const applyThemeTool: ToolDefinition = {
  name: "apply_theme",
  description:
    "Re-theme an existing deck JSON — swap the theme in meta while keeping all slide content unchanged.",
  inputSchema: {
    type: "object",
    properties: {
      json: { type: "string", description: "Deck JSON string" },
      target_theme: { type: "string", description: "Theme name to apply" }
    },
    required: ["json", "target_theme"]
  },
  handler: async (input: Record<string, unknown>) => {
    const rawJson = input["json"] as string;
    const targetTheme = input["target_theme"] as string;

    let deck: Record<string, unknown>;
    try {
      deck = JSON.parse(rawJson) as Record<string, unknown>;
    } catch (err) {
      throw new Error(`Invalid JSON: ${(err as Error).message}`);
    }

    const meta = (deck["meta"] ?? {}) as Record<string, unknown>;
    meta["theme"] = targetTheme;
    deck["meta"] = meta;

    return { json: JSON.stringify(deck, null, 2) };
  }
};
