"""presentation-skill-pack-render — Python binding.

Renders a deck JSON spec (dict or JSON string) to a self-contained HTML slide deck.
Mirrors the Node renderer API; reads theme JSON and shared templates from the
installed package data.
"""

from .renderer import render_deck, get_bundled_themes_dir, RenderOptions

__all__ = ["render_deck", "get_bundled_themes_dir", "RenderOptions"]
__version__ = "0.1.0"
