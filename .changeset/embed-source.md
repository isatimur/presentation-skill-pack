---
"@presentation-skill-pack/render": minor
---

Embed the source Deck JSON in rendered HTML so created presentations are editable.

Every rendered deck now includes a `<script type="application/json" id="psp-deck">`
carrying its source spec (opt out with `embedSource: false`). This lets a created
`.html` be reopened and edited (e.g. in the studio) and re-rendered identically.
CLI (`render`) and the MCP `render_deck`/`export_deck` tools inherit this automatically.
