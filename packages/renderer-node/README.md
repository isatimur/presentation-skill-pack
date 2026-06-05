# @presentation-skill-pack/render

Turns a [deck JSON spec](../../packages/core/references/deck-schema.md) into a polished,
self-contained HTML slide deck — no build step, no external assets beyond Google Fonts.

## Install

```bash
npm install @presentation-skill-pack/render
# or
pnpm add @presentation-skill-pack/render
```

## CLI

```bash
# Render a file
presentation-skill-pack-render deck.json -o slides.html

# Override theme
presentation-skill-pack-render deck.json --theme default-tech -o slides.html

# Pipe from stdin
cat deck.json | presentation-skill-pack-render -o slides.html

# Validate only (no output file)
presentation-skill-pack-render deck.json --validate

# List available themes
presentation-skill-pack-render --list-themes
```

## Programmatic API

```typescript
import { renderDeck } from "@presentation-skill-pack/render";
import { readFile, writeFile } from "node:fs/promises";

const deckJson = await readFile("deck.json", "utf-8");
const html = await renderDeck(deckJson, {
  extraCss: ".slide { font-size: 18px; }",
});
await writeFile("output.html", html);
```

### `renderDeck(deckJson, opts?): Promise<string>`

| Option | Type | Description |
|--------|------|-------------|
| `themesDir` | `string` | Override bundled themes directory |
| `extraCss` | `string` | Additional CSS appended after base styles |

Throws if the deck JSON is invalid (schema errors included in message).

### `getBundledThemesDir(): string`

Returns the absolute path to the bundled themes directory from `@presentation-skill-pack/core`.

## See also

- [Main README](../../README.md)
- [Deck schema reference](../../packages/core/references/deck-schema.md)
- [Theme reference](../../packages/core/references/themes.md)
