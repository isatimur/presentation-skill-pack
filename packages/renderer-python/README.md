# presentation-skill-pack-render

Python CLI wrapper for [@presentation-skill-pack/render](https://www.npmjs.com/package/@presentation-skill-pack/render).

Renders a deck JSON spec into a self-contained HTML slide deck via the Node.js renderer.

## Install

```bash
pip install presentation-skill-pack-render
```

## Usage

```bash
psp-render deck.json -o deck.html --theme corporate
psp-render deck.json --theme retro-arcade > deck.html
```

## Requirements

Node.js ≥ 18 and `npx` must be available on `PATH`.

## Part of presentation-skill-pack

- npm: `@presentation-skill-pack/render`
- Themes: `@presentation-skill-pack/theme-*`
- MCP server: `@presentation-skill-pack/mcp-server`
- Adapter installer: `npx @presentation-skill-pack/install`
