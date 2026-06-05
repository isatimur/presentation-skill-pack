# presentation-skill-pack — Codex adapter

Installs the `presentation-generator` skill into OpenAI Codex so the agent can turn rough notes into polished HTML slide decks on demand.

## What gets installed

| Mode | What happens |
|------|-------------|
| **full** (default) | Copies `SKILL.md` + `references/` to `~/.codex/skills/presentation-generator/` **and** registers the MCP server in `~/.codex/config.json`. |
| **lite** | Copies `SKILL.md` + `references/` only — no MCP server. |

## Install

### Via the install CLI (recommended)

```bash
# full (MCP tools enabled)
npx @presentation-skill-pack/install codex

# lite (skill only, no MCP)
npx @presentation-skill-pack/install codex lite
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

## Where the skill lands

```
~/.codex/
  skills/
    presentation-generator/
      SKILL.md
      references/
        deck-schema.md
        themes.md
  config.json    ← MCP server entry (full mode only)
```

## After installing

Restart Codex. Ask:

> "Build a 10-slide investor pitch deck for my SaaS startup. Use the corporate theme. Here are my bullet points: ..."

## Uninstall

```bash
rm -rf ~/.codex/skills/presentation-generator
# edit ~/.codex/config.json to remove the presentation-skill-pack entry if needed
```
