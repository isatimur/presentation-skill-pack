# presentation-skill-pack — GitHub Copilot adapter

Installs the presentation-generator skill for GitHub Copilot in VS Code by writing
`.github/copilot-instructions.md` in your current project directory.

Run from the **root of your project**:

```bash
npx @presentation-skill-pack/install copilot
```

## What gets installed

| Mode | What lands |
|------|-----------|
| full (default) | `.github/copilot-instructions.md` + `.vscode/mcp.json` |
| lite | `.github/copilot-instructions.md` only |

**Full mode** registers the MCP server (`@presentation-skill-pack/mcp-server`) in
`.vscode/mcp.json`. VS Code 1.99+ picks this up automatically — Copilot gets five
structured tools: `render_deck`, `list_themes`, `get_theme`, `validate_deck`, `create_deck`.

**Lite mode** copies the skill definition only. Copilot still generates decks via the
direct-HTML path (no structured tool calls).

## After install

Restart VS Code (or reload the window). Then in Copilot Chat:

```
Build a 10-slide pitch deck from these notes: [paste your content]
```

## Notes

- Unlike other adapters, Copilot instructions are **project-scoped**, not user-scoped.
  Run this once per project.
- `.github/copilot-instructions.md` is generated from the published `@presentation-skill-pack/core`
  SKILL.md — do not edit it by hand; re-run the installer to update.
