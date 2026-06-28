import type { ResolvedTheme } from "@presentation-skill-pack/core";
import type { PptxShapeArg } from "./pptx.js";
import { resolveColor } from "./color.js";
import { parseFontFamily, isBoldWeight } from "./font.js";

/**
 * Derived, PPTX-ready values for a theme: dimensions in inches, opaque hex
 * colors, and font faces. Built once per deck and shared by every layout mapper.
 */
export interface ExportContext {
  /** Slide width in inches (from theme geometry.slideWidth, default 13.333"). */
  width: number;
  /** Slide height in inches (16:9 of width). */
  height: number;
  /** Outer content margin in inches. */
  margin: number;
  colors: {
    bg: string;
    bg2: string;
    text: string;
    muted: string;
    accent: string;
    accent2: string;
    cardBg: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    headingBold: boolean;
  };
  /** pptxgenjs ShapeType handles, supplied from the presentation instance. */
  shapeRoundRect: PptxShapeArg;
  shapeOval: PptxShapeArg;
  warn: (msg: string) => void;
}

export interface ContextShapes {
  roundRect: PptxShapeArg;
  oval: PptxShapeArg;
}

const PX_PER_INCH = 96;

function parsePxToInches(value: string, fallback: number): number {
  const m = value.match(/([\d.]+)\s*px/i);
  if (m) {
    const px = parseFloat(m[1]!);
    if (Number.isFinite(px) && px > 0) return px / PX_PER_INCH;
  }
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n / PX_PER_INCH : fallback;
}

export function buildContext(
  theme: ResolvedTheme,
  shapes: ContextShapes,
  warn: (msg: string) => void
): ExportContext {
  const width = parsePxToInches(theme.geometry.slideWidth, 13.333);
  const height = (width * 9) / 16;
  const bg = resolveColor(theme.palette.bg);

  return {
    width,
    height,
    margin: Math.min(0.6, width * 0.05),
    colors: {
      bg,
      bg2: resolveColor(theme.palette.bg2, theme.palette.bg),
      text: resolveColor(theme.palette.text, theme.palette.bg),
      muted: resolveColor(theme.palette.muted, theme.palette.bg),
      accent: resolveColor(theme.palette.accent, theme.palette.bg),
      accent2: resolveColor(theme.palette.accent2, theme.palette.bg),
      cardBg: resolveColor(theme.palette.cardBg, theme.palette.bg),
      border: resolveColor(theme.palette.border, theme.palette.bg),
    },
    fonts: {
      heading: parseFontFamily(theme.typography.headingFont),
      body: parseFontFamily(theme.typography.bodyFont),
      headingBold: isBoldWeight(theme.typography.headingWeight),
    },
    shapeRoundRect: shapes.roundRect,
    shapeOval: shapes.oval,
    warn,
  };
}
