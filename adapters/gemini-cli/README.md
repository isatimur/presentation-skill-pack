# presentation-skill-pack — Gemini CLI adapter

Installs the `presentation-generator` skill as a Gemini CLI extension so the agent can turn rough notes into polished HTML slide decks on demand.

## What gets installed

| Mode | What happens |
|------|-------------|
| **full** (default) | Writes `SKILL.md` + `extension.json` to `~/.gemini/extensions/presentation-generator/` **and** registers the MCP server in `~/.gemini/settings.json`. |
| **lite** | Writes the extension files only — no MCP server. |

The `extension.json` tells Gemini CLI to load `SKILL.md` as a skill definition. With full mode, the 5 MCP tools (`render_deck`, `list_themes`, `get_theme`, `validate_deck`, `create_deck`) are also available.

## Install

### Via the install CLI (recommended)

```bash
# full (MCP tools enabled)
npx @presentation-skill-pack/install gemini-cli

# lite (extension only, no MCP)
npx @presentation-skill-pack/install gemini-cli lite
```

### Manual — bash (macOS / Linux)

```bash
PSP_CORE_DIR=/path/to/node_modules/@presentation-skill-pack/core bash install.sh full
```

### Manual — PowerShell (Windows)

```powershell
$env:PSP_CORE_DIR = "C:\path\to\node_modules\@presentation-skill-pack\core"
.\install.ps1 full
```

## Where the extension lands

```
~/.gemini/
  extensions/
    presentation-generator/
      SKILL.md          ← skill definition
      extension.json    ← Gemini CLI extension manifest
  settings.json         ← MCP server entry (full mode only)
```

## After installing

Restart Gemini CLI. Ask:

> "Create a 10-slide deck about our Q3 product roadmap. Use the luxury-minimalist theme."

## Uninstall

```bash
rm -rf ~/.gemini/extensions/presentation-generator
# edit ~/.gemini/settings.json to remove the presentation-skill-pack entry if needed
```
