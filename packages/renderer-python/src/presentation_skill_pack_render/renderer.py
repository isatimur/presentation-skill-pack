"""Core renderer: deck JSON → self-contained HTML."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader

_HERE = Path(__file__).parent
_SHARED = _HERE.parent.parent.parent / "shared"  # monorepo layout (packages/shared)
_BUNDLED_THEMES = _HERE.parent.parent.parent / "core" / "themes"  # monorepo layout

# Installed layout: package data lives alongside this file
_TEMPLATES_DIR = _HERE / "templates"


def get_bundled_themes_dir() -> Path:
    """Return the path to the bundled themes directory."""
    if _TEMPLATES_DIR.exists():
        return _HERE / "themes"
    return _BUNDLED_THEMES


def _get_shared_dir() -> Path:
    if _TEMPLATES_DIR.exists():
        return _TEMPLATES_DIR
    return _SHARED


VALID_LAYOUTS = {
    "title", "two-column", "feature-grid", "quote",
    "data-table", "stat-row", "timeline", "section", "closing",
}

DEFAULT_PALETTE: dict[str, str] = {
    "bg": "#0e0e12", "bg2": "#16161d", "text": "#f4f4f5",
    "muted": "#a1a1aa", "accent": "#7c3aed", "accent2": "#22d3ee",
    "cardBg": "rgba(255,255,255,0.04)", "border": "rgba(255,255,255,0.08)",
}
DEFAULT_TYPOGRAPHY: dict[str, Any] = {
    "headingFont": "'Montserrat', system-ui, sans-serif",
    "bodyFont": "'Open Sans', system-ui, sans-serif",
    "headingWeight": 800,
    "googleFonts": ["Montserrat:wght@700;800", "Open+Sans:wght@400;600"],
}
DEFAULT_GEOMETRY: dict[str, str] = {"radius": "18px", "slideWidth": "1280px"}


@dataclass
class RenderOptions:
    themes_dir: Path | None = None
    extra_css: str = ""
    attribution: bool = True
    """Append a theme-aware "Made with presentation-skill-pack" footer. Default True."""


_ATTRIBUTION_URL = "https://presentation-skill-pack.vercel.app/?ref=deck"

_ATTRIBUTION_HTML = (
    '<footer class="psp-attribution">Made with '
    f'<a href="{_ATTRIBUTION_URL}" target="_blank" rel="noopener">presentation-skill-pack</a>'
    "</footer>"
)

_ATTRIBUTION_CSS = """
/* presentation-skill-pack attribution footer */
.psp-attribution {
  font-family: var(--body-font);
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--muted);
  opacity: 0.6;
  text-align: center;
  padding: 4px 0 16px;
}
.psp-attribution a {
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--muted) 40%, transparent);
  transition: color 0.15s ease, border-color 0.15s ease;
}
.psp-attribution a:hover { color: var(--accent); border-color: var(--accent); }
@media print { .psp-attribution { opacity: 0.5; } }"""


def _load_theme(name: str, themes_dir: Path) -> dict[str, Any]:
    chain: list[dict[str, Any]] = []
    current: str | None = name
    seen: set[str] = set()
    while current and current not in seen:
        seen.add(current)
        manifest = json.loads((themes_dir / current / "theme.json").read_text())
        chain.insert(0, manifest)
        current = manifest.get("extends")

    palette = dict(DEFAULT_PALETTE)
    typography: dict[str, Any] = dict(DEFAULT_TYPOGRAPHY)
    geometry = dict(DEFAULT_GEOMETRY)
    for m in chain:
        palette.update(m.get("roles", {}))
        typography.update(m.get("typography", {}))
        geometry.update(m.get("geometry", {}))
    return {"palette": palette, "typography": typography, "geometry": geometry}


def _google_fonts_url(families: list[str]) -> str:
    if not families:
        return ""
    joined = "&family=".join(families)
    return f"https://fonts.googleapis.com/css2?family={joined}&display=swap"


def _normalize_slide(slide: dict[str, Any]) -> dict[str, Any]:
    out = dict(slide)
    if slide.get("layout") == "data-table" and isinstance(slide.get("rows"), list):
        out["rows"] = [{"cells": row} for row in slide["rows"]]
    if slide.get("layout") == "feature-grid" and not slide.get("columns"):
        out["columns"] = 3
    return out


def render_deck(deck_json: str | dict[str, Any], opts: RenderOptions | None = None) -> str:
    """Render a deck JSON spec to a self-contained HTML string."""
    if opts is None:
        opts = RenderOptions()

    if isinstance(deck_json, str):
        deck = json.loads(deck_json)
    else:
        deck = deck_json

    if deck.get("type") != "deck":
        raise ValueError('deck.type must be "deck"')
    if not deck.get("slides"):
        raise ValueError("deck.slides must be a non-empty array")

    theme_name = (deck.get("meta") or {}).get("theme", "default-tech")
    themes_dir = opts.themes_dir or get_bundled_themes_dir()
    theme = _load_theme(theme_name, themes_dir)

    fonts_url = _google_fonts_url(theme["typography"].get("googleFonts", []))
    shared_dir = _get_shared_dir()

    env = Environment(loader=FileSystemLoader(str(shared_dir / "layouts")), autoescape=False)

    token_map = {
        "bg": theme["palette"]["bg"],
        "bg2": theme["palette"]["bg2"],
        "text": theme["palette"]["text"],
        "muted": theme["palette"]["muted"],
        "accent": theme["palette"]["accent"],
        "accent2": theme["palette"]["accent2"],
        "cardBg": theme["palette"]["cardBg"],
        "border": theme["palette"]["border"],
        "radius": theme["geometry"]["radius"],
        "slideW": theme["geometry"]["slideWidth"],
        "headingFont": theme["typography"]["headingFont"],
        "bodyFont": theme["typography"]["bodyFont"],
        "headingWeight": str(theme["typography"]["headingWeight"]),
    }

    from jinja2 import Template  # noqa: PLC0415
    base_css_raw = (shared_dir / "base.css").read_text()
    # base.css uses {{token}} mustache — replace with Jinja2 then render
    base_css_j2 = base_css_raw.replace("{{", "{{ ").replace("}}", " }}")
    # Simple string replacement is safer here since tokens are simple identifiers
    base_css = base_css_raw
    for k, v in token_map.items():
        base_css = base_css.replace("{{" + k + "}}", v)

    full_css = (f"@import url('{fonts_url}');\n\n" if fonts_url else "") + base_css
    if opts.attribution:
        full_css += f"\n\n{_ATTRIBUTION_CSS}"
    if opts.extra_css:
        full_css += f"\n\n{opts.extra_css}"

    slides_html_parts: list[str] = []
    for slide in deck["slides"]:
        layout = slide.get("layout", "title")
        if layout not in VALID_LAYOUTS:
            raise ValueError(f"Unknown layout: {layout!r}")
        # Read layout HTML and do mustache-style substitution via simple replacement
        layout_template = (shared_dir / "layouts" / f"{layout}.html").read_text()
        normalized = _normalize_slide(slide)
        # Use a simple mustache-compatible renderer for the layout fragments
        rendered = _render_mustache(layout_template, normalized)
        slides_html_parts.append(rendered)

    slides_html = "\n".join(slides_html_parts)
    doc_template = (shared_dir / "document.html").read_text()
    meta = deck.get("meta") or {}
    html = _render_mustache(doc_template, {
        "title": meta.get("title") or meta.get("company") or "Presentation",
        "description": meta.get("description") or "",
        "styles": full_css,
        "slides": slides_html,
        "attribution": _ATTRIBUTION_HTML if opts.attribution else "",
    })
    return html


def _render_mustache(template: str, data: dict[str, Any]) -> str:
    """Minimal mustache renderer supporting {{var}}, {{{var}}}, {{#list}}...{{/list}}, {{^}}."""
    try:
        import chevron  # type: ignore[import]
        return chevron.render(template, data)
    except ImportError:
        pass
    # Fallback: use the pystache-compatible approach via regex
    import re

    def replace_sections(tmpl: str, ctx: dict[str, Any]) -> str:
        # Handle {{#list}}...{{/list}}
        def section_repl(m: re.Match[str]) -> str:
            key, body = m.group(1), m.group(2)
            val = ctx.get(key)
            if not val:
                return ""
            if isinstance(val, list):
                return "".join(replace_sections(body, {**ctx, **item} if isinstance(item, dict) else ctx) for item in val)
            return replace_sections(body, ctx)

        tmpl = re.sub(r"\{\{#(\w+)\}\}(.*?)\{\{/\1\}\}", section_repl, tmpl, flags=re.DOTALL)
        # Handle {{^key}}...{{/key}} (inverted)
        def inv_repl(m: re.Match[str]) -> str:
            key, body = m.group(1), m.group(2)
            return body if not ctx.get(key) else ""
        tmpl = re.sub(r"\{\{\^(\w+)\}\}(.*?)\{\{/\1\}\}", inv_repl, tmpl, flags=re.DOTALL)
        # Triple mustache (unescaped)
        tmpl = re.sub(r"\{\{\{(\w+)\}\}\}", lambda m: str(ctx.get(m.group(1), "")), tmpl)
        # Double mustache (escaped)
        import html as html_mod
        tmpl = re.sub(r"\{\{(\w+)\}\}", lambda m: html_mod.escape(str(ctx.get(m.group(1), ""))), tmpl)
        return tmpl

    return replace_sections(template, data)
