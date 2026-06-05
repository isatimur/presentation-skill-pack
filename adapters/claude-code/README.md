# presentation-skill-pack — Claude Code adapter

Installs the `presentation-generator` skill into Claude Code so the agent can turn rough notes into polished HTML slide decks on demand.

## What gets installed

| Mode | What happens |
|------|-------------|
| **full** (default) | Copies `SKILL.md` + `references/` to `~/.claude/skills/presentation-generator/` **and** registers the MCP server (`presentation-skill-pack`) in `~/.claude/mcp.json`, enabling the 5 MCP tools (`render_deck`, `list_themes`, `get_theme`, `validate_deck`, `create_deck`). |
| **lite** | Copies `SKILL.md` + `references/` only. The skill is available but no MCP tools. Claude uses the deck-spec CLI path or direct-HTML fallback. |

## Install

### Via the install CLI (recommended)

```bash
# full (MCP tools enabled)
npx @presentation-skill-pack/install claude-code

# lite (skill only, no MCP)
npx @presentation-skill-pack/install claude-code lite
```

### Manual — bash (macOS / Linux)

```bash
export PSP_CORE_DIR="$(npm pack --dry-run --json @presentation-skill-pack/core 2>/dev/null | \
  node -e "const p=require('path');const d=require('os').homedir();process.stdout.write(p.join(d,''))")"
# easier: just point at the unpacked package directory
PSP_CORE_DIR=/path/to/node_modules/@presentation-skill-pack/core bash install.sh full
```

### Manual — PowerShell (Windows)

```powershell
$env:PSP_CORE_DIR = "C:\path\to\node_modules\@presentation-skill-pack\core"
.\install.ps1 full
```

## Where the skill lands

```
~/.claude/
  skills/
    presentation-generator/
      SKILL.md          ← the skill definition Claude reads
      references/
        deck-schema.md  ← layout + field reference
        themes.md       ← theme catalogue
  mcp.json              ← MCP server entry (full mode only)
```

## After installing

Restart Claude Code. Then ask:

> "Create a 10-slide pitch deck for Acme using the corporate theme. Here are my notes: ..."

Claude picks up the skill automatically when the trigger words match ("presentation", "slide deck", "pitch deck", "slides").

## Uninstall

```bash
rm -rf ~/.claude/skills/presentation-generator
# if you want to remove the MCP server entry, edit ~/.claude/mcp.json manually
```
