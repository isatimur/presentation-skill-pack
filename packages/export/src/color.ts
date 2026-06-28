/**
 * Color utilities for PPTX export.
 *
 * pptxgenjs wants solid 6-digit hex (no leading `#`). Theme palettes mix plain
 * hex (`#0e0e12`) with `rgba(...)` tokens (e.g. cardBg/border layered over the
 * slide background). We resolve everything to an opaque hex by compositing any
 * alpha over a known background color.
 */

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function toHex2(n: number): string {
  return clamp255(n).toString(16).padStart(2, "0");
}

/** Parse `#rgb`, `#rrggbb`, `rgb(...)`, or `rgba(...)`. Returns null if unknown. */
function parseColor(value: string): Rgba | null {
  const v = value.trim();

  if (v.startsWith("#")) {
    const hex = v.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0]! + hex[0]!, 16);
      const g = parseInt(hex[1]! + hex[1]!, 16);
      const b = parseInt(hex[2]! + hex[2]!, 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    return null;
  }

  const m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1]!.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      return {
        r: parseFloat(parts[0]!),
        g: parseFloat(parts[1]!),
        b: parseFloat(parts[2]!),
        a: parts.length >= 4 ? parseFloat(parts[3]!) : 1,
      };
    }
  }

  return null;
}

/** Alpha-composite `fg` over `bg` (both Rgba), returning an opaque Rgba. */
function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

const FALLBACK_BG: Rgba = { r: 14, g: 14, b: 18, a: 1 };

/**
 * Resolve a CSS color token to opaque 6-digit hex (uppercase, no `#`).
 * Translucent colors are composited over `background` so cards/borders stay visible.
 */
export function resolveColor(value: string, background = "#0e0e12"): string {
  const parsed = parseColor(value);
  if (!parsed) {
    // Unknown (named color, gradient, etc.) — fall back to a neutral light gray.
    return "AAAAAA";
  }
  const bg = parseColor(background) ?? FALLBACK_BG;
  const solid = parsed.a < 1 ? composite(parsed, bg) : parsed;
  return (toHex2(solid.r) + toHex2(solid.g) + toHex2(solid.b)).toUpperCase();
}
