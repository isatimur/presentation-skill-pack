# @presentation-skill-pack/studio

A browser-based editor studio for presentation-skill-pack decks. Edit slides through
schema-driven forms, see a live preview, and export to HTML or **native, editable PowerPoint
(`.pptx`)** — which also opens in Keynote and imports into Google Slides.

It's a fully **static** Vite + React SPA: rendering and `.pptx` generation happen client-side, so
there's no backend, no API keys, and nothing to host beyond static files.

## Develop

```bash
pnpm --filter @presentation-skill-pack/studio dev       # http://localhost:5173
pnpm --filter @presentation-skill-pack/studio build     # static build → dist/
pnpm --filter @presentation-skill-pack/studio test      # unit tests (render + themes)
pnpm --filter @presentation-skill-pack/studio test:e2e  # Playwright flow (needs: npx playwright install chromium)
```

## What it does

- **Slide list** — add (any of the 9 layouts), duplicate, reorder, delete.
- **Form editor** — fields per layout (cards, stats, steps, table rows…), driven by the deck schema.
- **Live preview** — an `<iframe>` rendered with the same shared Mustache layouts + theme tokens as
  the canonical Node renderer, so what you see matches the published deck.
- **Export** — Download HTML, Download `.pptx`, or export the raw Deck JSON. Import any Deck JSON to
  keep editing. Theme picker covers every bundled + workspace theme.

## How it stays in sync with the renderer

`src/render/` is a fs-free port of `@presentation-skill-pack/render`: it bundles the shared
`layouts/*.html`, `base.css`, and every `theme.json` at build time (via `import.meta.glob` / `?raw`)
and resolves the theme `extends` chain in-memory. PPTX export reuses `@presentation-skill-pack/export`
directly (`deckToPptxBlob`).

## Deploy

The build uses a relative `base` (`./`), so the same output works at `/` or any sub-path.

- **Under the gallery (default):** `pnpm --filter @presentation-skill-pack/studio build:web` emits a
  production build into `web/studio/`, served at `/studio` by the gallery's Vercel deploy. The
  "Open Studio" button in `web/index.html` links there. Re-run after studio changes — `web/studio/`
  is generated output.
- **Standalone:** `pnpm build` → `dist/`; deploy as its own Vercel project (config in `vercel.json`).
