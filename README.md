# presentation-skill-pack

[![npm version](https://img.shields.io/npm/v/@presentation-skill-pack/core)](https://www.npmjs.com/package/@presentation-skill-pack/core)
[![PyPI](https://img.shields.io/pypi/v/presentation-skill-pack-render)](https://pypi.org/project/presentation-skill-pack-render/)
[![CI](https://github.com/your-org/presentation-skill-pack/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/presentation-skill-pack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Turn rough notes into a polished slide deck — for any AI agent.**

---

## Quick start

```bash
npx @presentation-skill-pack/install claude-code
```

That single command installs the skill file and registers the MCP server for your agent. Restart your agent and ask it to "create a presentation about…" — it will produce a validated deck JSON and render it to a self-contained HTML file you can open in any browser.

---

## What it is

presentation-skill-pack is a universal skill layer that gives AI coding agents (Claude Code, Cursor, Codex, Gemini CLI, and plain CLI) a structured, schema-validated way to author slide decks. The agent writes a Deck JSON spec; the renderer turns that spec into a single self-contained HTML file — no build tool, no slide hosting service required. Themes are swappable, publishable npm packages, and the MCP server exposes the full workflow as five typed tools.

---

## Packages

| Package | Description |
|---|---|
| [`@presentation-skill-pack/core`](packages/core) | Deck + theme schemas, theme loader, validator, and bundled default-tech theme |
| [`@presentation-skill-pack/render`](packages/renderer-node) | Node.js renderer — CLI (`presentation-skill-pack-render`) + programmatic API |
| [`@presentation-skill-pack/mcp-server`](packages/mcp-server) | MCP server exposing all tools to any MCP-compatible agent (`presentation-skill-pack-mcp`) |
| [`@presentation-skill-pack/install`](packages/install) | One-command installer that wires the skill + MCP server into your agent (`presentation-skill-pack-install`) |
| [`@presentation-skill-pack/create-theme`](packages/create-theme) | Scaffold a new publishable theme package (`create-presentation-theme`) |
| [`@presentation-skill-pack/theme-corporate`](packages/themes/corporate) | Formal corporate theme |
| [`@presentation-skill-pack/theme-playful`](packages/themes/playful) | Playful creative-agency theme |
| [`@presentation-skill-pack/theme-luxury-minimalist`](packages/themes/luxury-minimalist) | Luxury minimalist theme |
| [`@presentation-skill-pack/theme-retro-arcade`](packages/themes/retro-arcade) | Retro 80s arcade theme |
| [`presentation-skill-pack-render`](packages/renderer-python) _(PyPI)_ | Python renderer for agents and pipelines running outside Node.js |

---

## Themes

| Theme | Vibe |
|---|---|
| `default-tech` | Dark background, electric-blue accent, mono code feel — ships bundled in core |
| `corporate` | Crisp white canvas, navy text, restrained blue accent — boardroom-ready |
| `playful` | Warm white, coral + lime accents, rounded corners, oversized type — creative-agency energy |
| `luxury-minimalist` | Off-white canvas, charcoal text, hairline borders, zero gradients — quiet confidence |
| `retro-arcade` | Deep purple-black background, magenta + cyan neon, pixel fonts — 8-bit nostalgia |

---

## Adapters

| Adapter | Description | Install |
|---|---|---|
| `claude-code` | Registers MCP server in `~/.claude/mcp.json` + copies skill file | `npx @presentation-skill-pack/install claude-code` |
| `cursor` | Adds MCP server entry to `.cursor/mcp.json` | `npx @presentation-skill-pack/install cursor` |
| `codex` | Adds MCP server to `~/.codex/config.json` | `npx @presentation-skill-pack/install codex` |
| `gemini-cli` | Registers tool server in `~/.gemini/config.json` | `npx @presentation-skill-pack/install gemini-cli` |
| `cli` | Standalone — renders decks directly via the `presentation-skill-pack-render` CLI, no MCP | `npx @presentation-skill-pack/install cli` |

---

## Deck JSON example

```json
{
  "type": "deck",
  "meta": {
    "title": "Q3 Product Review",
    "company": "Acme Inc.",
    "theme": "corporate"
  },
  "slides": [
    {
      "layout": "title",
      "heading": "Q3 Product Review",
      "subheading": "July – September 2026"
    },
    {
      "layout": "stat-row",
      "heading": "By the numbers",
      "stats": [
        { "label": "MRR", "value": "$420k", "delta": "+18%" },
        { "label": "Active users", "value": "12,400", "delta": "+31%" },
        { "label": "NPS", "value": "67", "delta": "+9 pts" }
      ]
    },
    {
      "layout": "two-column",
      "heading": "What we shipped",
      "left": "**Instant replay** — users can re-watch any session segment in one click.\n\n**Smart digest** — daily AI summary delivered to Slack.",
      "right": "**API v2** — full REST + webhook parity with the legacy SOAP interface.\n\n**iOS 18 widgets** — glanceable stats on the lock screen."
    },
    {
      "layout": "feature-grid",
      "heading": "Upcoming in Q4",
      "columns": 2,
      "cards": [
        { "title": "Real-time co-editing", "body": "Multiple agents annotating the same deck simultaneously." },
        { "title": "Theme marketplace", "body": "Browse and install community themes directly from the CLI." },
        { "title": "PDF export", "body": "One-command headless export via Playwright." },
        { "title": "Enterprise SSO", "body": "SAML 2.0 + SCIM provisioning for large org rollouts." }
      ]
    },
    {
      "layout": "quote",
      "quote": "The best presentation is the one that actually gets made.",
      "attribution": "— Every engineer who missed a deadline"
    },
    {
      "layout": "timeline",
      "heading": "Q4 milestones",
      "events": [
        { "date": "Oct 15", "label": "Co-editing beta" },
        { "date": "Nov 1",  "label": "Theme marketplace launch" },
        { "date": "Nov 20", "label": "PDF export GA" },
        { "date": "Dec 10", "label": "Enterprise SSO GA" }
      ]
    },
    {
      "layout": "data-table",
      "heading": "Regional breakdown",
      "headers": ["Region", "MRR", "Growth"],
      "rows": [
        ["North America", "$210k", "+22%"],
        ["Europe",        "$140k", "+15%"],
        ["APAC",          "$70k",  "+41%"]
      ]
    },
    {
      "layout": "closing",
      "heading": "Questions?",
      "subheading": "deck source at github.com/your-org/presentation-skill-pack"
    }
  ]
}
```

---

## MCP tools

| Tool | Purpose |
|---|---|
| `generate_deck_prompt` | Build a system prompt containing the active theme palette and deck schema reference, ready to paste into an agent context |
| `render_deck` | Render a Deck JSON string to a self-contained HTML file |
| `audit_deck` | Validate a Deck JSON against the schema and return structured issues |
| `apply_theme` | Swap the theme in a deck's `meta` block while leaving all slide content untouched |
| `list_themes` | Enumerate all available themes (bundled + installed npm packages) with name, version, and vibe |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE).
