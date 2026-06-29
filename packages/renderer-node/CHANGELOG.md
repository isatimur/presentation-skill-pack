# @presentation-skill-pack/render

## 0.2.0

### Minor Changes

- e4b502e: Embed the source Deck JSON in rendered HTML so created presentations are editable.

  Every rendered deck now includes a `<script type="application/json" id="psp-deck">`
  carrying its source spec (opt out with `embedSource: false`). This lets a created
  `.html` be reopened and edited (e.g. in the studio) and re-rendered identically.
  CLI (`render`) and the MCP `render_deck`/`export_deck` tools inherit this automatically.

- a3f8544: Add PPTX export: take any deck into PowerPoint, Keynote, and Google Slides.

  - New `@presentation-skill-pack/export` package mapping each of the 9 structured
    layouts + theme roles to native, editable PowerPoint shapes (`deckToPptxBuffer` /
    `deckToPptxBlob` / `deckToPptxArrayBuffer`, isomorphic Node + browser).
  - `render` CLI gains `--format pptx` (and a shared `renderDeckPptx` API). The
    resulting `.pptx` opens directly in PowerPoint and Keynote, and imports into
    Google Slides via File → Import.
  - New `export_deck` MCP tool so agents can export decks to `.pptx` (or html).

### Patch Changes

- Updated dependencies [a3f8544]
  - @presentation-skill-pack/export@0.2.0

## 0.2.0

### Minor Changes

- d8d2fb0: Initial release of presentation-skill-pack v0.1.0.

  Turn rough notes into a polished, self-contained HTML slide deck for any AI agent.
  Includes dual-language renderers (Node + Python), MCP server, 5 themes, 5 adapters,
  installer CLI, and interactive theme scaffolder.

### Patch Changes

- Updated dependencies [d8d2fb0]
  - @presentation-skill-pack/core@0.2.0
