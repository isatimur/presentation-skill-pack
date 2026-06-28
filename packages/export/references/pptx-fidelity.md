# PPTX export — fidelity notes

The exporter maps each structured deck slide to **native, editable** PowerPoint shapes
(text boxes, tables, rounded rectangles). It is intentionally *not* a pixel-perfect
screenshot of the HTML render — it trades exactness for editability. Known differences:

## Fonts
- Theme typography is a CSS stack (e.g. `'Montserrat', system-ui, sans-serif`). We use the
  first concrete family as the PowerPoint font face. If that font isn't installed on the
  viewer's machine, PowerPoint/Keynote substitutes a default — text reflows slightly.
- Generic keywords leading a stack fall back to `Arial`.
- Google Fonts are **not** embedded. Install the font, or accept substitution.

## Colors
- Solid hex maps directly. Translucent `rgba(...)` tokens (cardBg, border) are
  alpha-composited over the slide background to an opaque hex so cards/borders stay visible.
- CSS gradients and `color-mix(...)` are not represented — backgrounds export as the flat
  `bg` color.

## Layout
- Geometry uses `theme.geometry.slideWidth` (px → inches at 96dpi) at native 16:9.
- Long text uses PowerPoint "shrink to fit," so it stays inside its box rather than clipping.

## Content that isn't 1:1
- **Images:** only inline `data:` URIs are embedded. Remote/local URL images are **not**
  fetched (the exporter does no network I/O); a captioned placeholder is drawn and a warning
  is emitted. (The studio can pre-fetch to data URIs before export.)
- **Icons:** FontAwesome glyphs aren't rendered; each feature-grid card shows a small accent
  marker in their place.
- Every non-mappable field emits a warning (via `opts.onWarn` / `result.warnings`) — nothing
  is dropped silently.

## Opening the .pptx
- **PowerPoint:** opens natively, fully editable.
- **Keynote:** File → Open the `.pptx` (Keynote has no portable native format).
- **Google Slides:** File → Import slides / upload to Drive → opens as an editable Slides deck.
