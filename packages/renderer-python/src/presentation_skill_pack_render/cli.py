"""CLI entry point for presentation-skill-pack-render."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .renderer import render_deck, get_bundled_themes_dir, RenderOptions


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="presentation-skill-pack-render",
        description="Render a deck JSON spec to a self-contained HTML slide deck.",
    )
    parser.add_argument("deck", nargs="?", help="Path to deck.json (reads stdin if omitted)")
    parser.add_argument("-o", "--output", default="deck.html", help="Output HTML file (default: deck.html)")
    parser.add_argument("-t", "--theme", help="Theme name (overrides deck meta.theme)")
    parser.add_argument("--list-themes", action="store_true", help="List available themes and exit")
    parser.add_argument("--validate", action="store_true", help="Validate only, do not render")
    args = parser.parse_args()

    if args.list_themes:
        themes_dir = get_bundled_themes_dir()
        themes = sorted(p.name for p in themes_dir.iterdir() if (p / "theme.json").exists())
        for t in themes:
            manifest = json.loads((themes_dir / t / "theme.json").read_text())
            vibe = manifest.get("vibe") or manifest.get("description") or ""
            print(f"  {t:<24} {vibe}")
        sys.exit(0)

    if args.deck:
        raw = Path(args.deck).read_text()
    else:
        raw = sys.stdin.read()

    if args.validate:
        try:
            deck = json.loads(raw)
            if deck.get("type") != "deck":
                print("INVALID: deck.type must be 'deck'", file=sys.stderr)
                sys.exit(1)
            if not deck.get("slides"):
                print("INVALID: deck.slides must be a non-empty array", file=sys.stderr)
                sys.exit(1)
            print("OK: deck is valid")
        except json.JSONDecodeError as e:
            print(f"INVALID: {e}", file=sys.stderr)
            sys.exit(1)
        sys.exit(0)

    if args.theme:
        deck_obj = json.loads(raw)
        deck_obj.setdefault("meta", {})["theme"] = args.theme
        raw = json.dumps(deck_obj)

    try:
        html = render_deck(raw, RenderOptions())
    except Exception as e:  # noqa: BLE001
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    Path(args.output).write_text(html, encoding="utf-8")
    print(f"Written to {args.output}")
