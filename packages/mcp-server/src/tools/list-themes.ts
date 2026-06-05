import { discoverInstalledThemes } from "@presentation-skill-pack/core";
import { getBundledThemesDir } from "@presentation-skill-pack/render";
import type { ToolDefinition } from "../server.js";

export const listThemesTool: ToolDefinition = {
  name: "list_themes",
  description:
    "List all available presentation-skill-pack themes with name, version, vibe, and description.",
  inputSchema: {
    type: "object",
    properties: {}
  },
  handler: async (_: Record<string, unknown>) => {
    const discovered = await discoverInstalledThemes({
      bundledThemesDir: getBundledThemesDir(),
      nodeModulesRoot: process.cwd()
    });

    const themes = discovered.map((d) => ({
      name: d.name,
      version: d.version,
      description: d.manifest.description,
      vibe: d.manifest.vibe,
      source: d.source
    }));

    return { themes };
  }
};
