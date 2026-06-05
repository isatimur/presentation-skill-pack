---
name: presentation-generator
description: Generate a complete, polished slide deck as a single self-contained HTML file with internal CSS (no Tailwind/Bootstrap/React; Google Fonts + FontAwesome allowed). Use when the user wants to build a presentation, slide deck, pitch deck, or "slides" from notes/data, or mentions converting rough content into HTML slides.
---

# Presentation Generator

Act as an expert frontend web developer and UI/UX presentation designer. Turn the user's
branding, layout, and raw content into one polished, self-contained HTML slide deck.

There are two ways to produce a deck. Prefer the **deck-spec path** when the
presentation-skill-pack renderer or MCP server is available — it is deterministic, themeable, and
re-renderable. Fall back to the **direct-HTML path** when no tooling is present.

## Deck-spec path (preferred)

1. Collect parameters (see below) and sequence the user's raw notes into slides.
2. Emit a **deck JSON** object conforming to [references/deck-schema.md](references/deck-schema.md):
   `{ "type": "deck", "meta": { "title", "company", "theme" }, "slides": [ ... ] }`.
   Each slide picks a `layout` from: `title`, `two-column`, `feature-grid`, `quote`,
   `data-table`, `stat-row`, `timeline`, `section`, `closing`.
3. Render it:
   - MCP: call `render_deck` with the deck JSON and a theme name.
   - CLI: `npx @presentation-skill-pack/render deck.json -o deck.html --theme <name>`.
   - List themes first with `list_themes` (or see [references/themes.md](references/themes.md)).

## Direct-HTML path (fallback)

Hand-write the full HTML deck. Hard constraints:

- **Single HTML file**, internal `<style>` only. NO Tailwind, Bootstrap, React, or external CSS/JS frameworks.
- You MAY `@import` Google Fonts and link FontAwesome (CDN) for icons.
- Each slide is a container locked to **16:9** (e.g. 1280×720), centered, with snap-scroll between slides.
- **Layout variety** — do NOT make every slide identical. Mix title, two-column, feature grid,
  full-bleed quote, data/table, stat row, timeline, section divider, closing/CTA.
- **Visual polish** — gradients, subtle drop shadows, rounded borders, geometric background
  elements. Use open placeholder images (`https://picsum.photos/...`) where appropriate.

See [references/element-templates.md](references/element-templates.md) for ready layout HTML/CSS.

## Parameters to collect

If the user hasn't supplied these, ask — but fill gaps with tasteful defaults that match the vibe.

- **Company/Project Name**
- **Color palette** — backgrounds, primary text, accent(s). Push for specifics ("dark navy with
  electric cyan" beats "blue"). With the deck-spec path, this maps to choosing/overriding a theme.
- **Typography** — heading + body fonts (Google Fonts).
- **Overall Vibe** — the styling lever (edgy tech, formal corporate, playful, luxury minimalist,
  retro arcade). This selects the theme and rewrites the whole look while keeping data intact.
- **Content & data** — accept raw, unorganized notes. You are the editor: group into a logical
  slide sequence, concise and impactful. Visual hierarchy over walls of text.

## Output

When the user wants copy-paste code, output **only** the complete raw HTML in a single code block.
Inside a project/repo, write a `.html` file and report the path (default to writing a file).
