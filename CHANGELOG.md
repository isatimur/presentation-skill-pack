# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This is a monorepo; packages are versioned independently. Versions below reflect
the latest published release of each package on its registry.

## [Unreleased]

### Planned

- `@presentation-skill-pack/export` — standalone Deck → PPTX export package (currently shipped via `@presentation-skill-pack/render`).
- `@presentation-skill-pack/studio` — browser editor as a published package (currently in-repo only).

## Published

### npm — `@presentation-skill-pack/*`

- `core` — 0.1.0 — Deck + theme schemas, theme loader, validator, bundled default-tech theme.
- `render` (renderer-node) — 0.1.0 — Node.js renderer CLI + programmatic API, incl. PPTX export.
- `mcp-server` — 0.1.0 — MCP server exposing render/export/themes/validate/create tools.
- `install` — 0.1.2 — One-command installer wiring the skill + MCP server into agents.
- `create-theme` — 0.1.0 — Scaffold a new publishable theme package.
- `theme-corporate` — 0.1.0 — Formal corporate theme.
- `theme-playful` — 0.1.0 — Playful creative-agency theme.
- `theme-luxury-minimalist` — 0.1.0 — Luxury minimalist theme.
- `theme-retro-arcade` — 0.1.0 — Retro 80s arcade theme.

### PyPI — `presentation-skill-pack-render`

- 0.1.0 — Python renderer CLI for agents and pipelines running outside Node.js.

[Unreleased]: https://github.com/isatimur/presentation-skill-pack/compare/HEAD...HEAD
