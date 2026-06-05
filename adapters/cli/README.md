# CLI adapter

The CLI renderer is available directly via npx — no install step required.

```bash
npx @presentation-skill-pack/render deck.json -o deck.html
npx @presentation-skill-pack/render deck.json -o deck.html --theme corporate
npx @presentation-skill-pack/render --list-themes
npx @presentation-skill-pack/render --validate deck.json
```

Or install globally:

```bash
npm i -g @presentation-skill-pack/render
presentation-skill-pack-render deck.json -o deck.html --theme playful
```

## Pipe from stdin

```bash
cat deck.json | npx @presentation-skill-pack/render -o deck.html
echo '{"type":"deck","meta":{"title":"Test","theme":"retro-arcade"},"slides":[...]}' \
  | npx @presentation-skill-pack/render -o test.html
```

## Options

| Flag | Description |
|------|-------------|
| `-o, --output <path>` | Output `.html` file path (default: `deck.html`) |
| `-t, --theme <name>` | Override the theme declared in `meta.theme` |
| `--list-themes` | Print all available themes and exit |
| `--validate` | Validate the deck JSON without rendering |

## Themes

Run `npx @presentation-skill-pack/render --list-themes` to see what's installed. Bundled themes: `default-tech`, `corporate`, `playful`, `luxury-minimalist`, `retro-arcade`.

Install additional themes:

```bash
npm i @presentation-skill-pack/theme-<name>
```

## Example deck.json

```json
{
  "type": "deck",
  "meta": {
    "title": "Acme Pitch",
    "company": "Acme",
    "theme": "corporate"
  },
  "slides": [
    {
      "layout": "title",
      "eyebrow": "Acme",
      "heading": "We make shipping fast.",
      "lead": "Zero-config CI/CD for any stack."
    },
    {
      "layout": "feature-grid",
      "heading": "Why teams love Acme",
      "columns": 3,
      "cards": [
        { "icon": "fa-solid fa-bolt",       "title": "Fast",    "body": "Deploys in under 60s." },
        { "icon": "fa-solid fa-shield",     "title": "Secure",  "body": "SOC 2 Type II." },
        { "icon": "fa-solid fa-chart-line", "title": "Proven",  "body": "200+ teams ship daily." }
      ]
    },
    {
      "layout": "closing",
      "heading": "Ready to ship faster?",
      "cta": { "label": "Start free trial", "href": "https://acme.example" }
    }
  ]
}
```
