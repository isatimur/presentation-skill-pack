# presentation-skill-pack

[![npm version](https://img.shields.io/npm/v/@presentation-skill-pack/core)](https://www.npmjs.com/package/@presentation-skill-pack/core)
[![PyPI](https://img.shields.io/pypi/v/presentation-skill-pack-render)](https://pypi.org/project/presentation-skill-pack-render/)
[![CI](https://github.com/isatimur/presentation-skill-pack/actions/workflows/ci.yml/badge.svg)](https://github.com/isatimur/presentation-skill-pack/actions/workflows/ci.yml)
[![Gallery](https://img.shields.io/badge/gallery-25%20decks-7C3AED)](https://presentation-skill-pack.vercel.app/#gallery)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Turn rough notes into a polished slide deck — in any AI agent. Then export it to PowerPoint, Keynote, or Google Slides.**

🌐 **[presentation-skill-pack.vercel.app](https://presentation-skill-pack.vercel.app)** — live gallery of 25 showcase decks · **[Studio](https://presentation-skill-pack.vercel.app/studio)** — edit decks in the browser

---

## Quick start

```bash
npx @presentation-skill-pack/install claude-code
```

That single command installs the skill file and registers the MCP server for your agent. Restart your agent and ask it to "create a presentation about…" — it produces a validated deck JSON and renders a self-contained HTML file you can open in any browser, or export to native, editable **PowerPoint** (which opens in Keynote and imports into Google Slides).

---

## What it is

presentation-skill-pack is a universal skill layer that gives AI coding agents (Claude Code, Cursor, Codex, Gemini CLI, Copilot, and plain CLI) a structured, schema-validated way to author slide decks. The agent writes a Deck JSON spec; the renderer turns it into a single self-contained HTML file — no build tool, no slide host. The same deck exports to native, editable **PowerPoint** (which opens in **Keynote** and imports into **Google Slides**), and a browser **studio** lets you open a created deck and edit it with live preview. Themes are swappable, publishable npm packages, and the MCP server exposes the whole workflow as typed tools.

---

## Packages

| Package | Description |
|---|---|
| [`@presentation-skill-pack/core`](packages/core) | Deck + theme schemas, theme loader, validator, and bundled default-tech theme |
| [`@presentation-skill-pack/render`](packages/renderer-node) | Node.js renderer — CLI (`presentation-skill-pack-render`) + programmatic API |
| [`@presentation-skill-pack/export`](packages/export) | Deck → native, editable PowerPoint (`.pptx`) — opens in PowerPoint & Keynote, imports into Google Slides |
| [`@presentation-skill-pack/studio`](packages/studio) | Browser editor studio: edit, live-preview, and export decks (Vite SPA) |
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
| `claude-code` | Copies skill to `~/.claude/skills/` + registers MCP server in `~/.claude/mcp.json` | `npx @presentation-skill-pack/install claude-code` |
| `cursor` | Adds `.mdc` rule to `~/.cursor/rules/` + MCP server entry | `npx @presentation-skill-pack/install cursor` |
| `copilot` | Writes to `.github/copilot-instructions.md` + `.vscode/mcp.json` (run from project root) | `npx @presentation-skill-pack/install copilot` |
| `codex` | Adds skill to `~/.codex/instructions.md` + MCP server | `npx @presentation-skill-pack/install codex` |
| `gemini-cli` | Writes GEMINI.md skill to `~/.gemini/instructions/` + MCP server | `npx @presentation-skill-pack/install gemini-cli` |
| `cli` | Standalone — renders decks via the `presentation-skill-pack-render` CLI, no MCP | `npx @presentation-skill-pack/install cli` |

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
      "subheading": "deck source at github.com/isatimur/presentation-skill-pack"
    }
  ]
}
```

---

## Export to PowerPoint, Keynote & Google Slides

Because a deck is *structured* data (not free-form HTML), every slide maps cleanly to native
slide shapes. One exporter covers all three apps:

```bash
# CLI
presentation-skill-pack-render deck.json --format pptx -o deck.pptx
```

```ts
// Programmatic (Node)
import { renderDeckPptx } from "@presentation-skill-pack/render";
await writeFile("deck.pptx", await renderDeckPptx(deckJson));
```

The result is a **native, editable** `.pptx`:

- **PowerPoint** — opens directly.
- **Keynote** — File → Open (Keynote has no portable native format; `.pptx` is the bridge).
- **Google Slides** — File → Import slides / upload to Drive → opens as an editable Slides deck.

Agents can call the `export_deck` MCP tool. Fidelity notes (fonts, colors, images) live in
[`packages/export/references/pptx-fidelity.md`](packages/export/references/pptx-fidelity.md).

## Studio

[`@presentation-skill-pack/studio`](packages/studio) is a browser editor: edit a deck through
schema-driven forms, see a live preview, and download HTML or `.pptx`. It's a fully static Vite SPA
(client-side render + export, no backend).

```bash
pnpm --filter @presentation-skill-pack/studio dev      # local editor
pnpm --filter @presentation-skill-pack/studio build    # static build → dist/ (deploy to Vercel)
```

## MCP tools

| Tool | Purpose |
|---|---|
| `render_deck` | Render a Deck JSON string to a self-contained HTML file |
| `export_deck` | Export a Deck JSON to a native, editable PowerPoint (`.pptx`) — or html |
| `list_themes` | Enumerate all available themes (bundled + installed npm packages) with name, version, and vibe |
| `get_theme` | Return the full theme JSON for a given theme name |
| `validate_deck` | Validate a Deck JSON against the schema and return structured issues with severity |
| `create_deck` | Create a new deck JSON spec from a text prompt or structured brief |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE).
