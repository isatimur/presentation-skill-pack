import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import Mustache from "mustache";
import {
  validateDeckJson as coreValidateDeckJson,
  loadTheme,
} from "@presentation-skill-pack/core";
import type { ValidationResult } from "@presentation-skill-pack/core";
import { deckToPptxBuffer, type DeckJson as ExportDeckJson } from "@presentation-skill-pack/export";

export { validateDeckJson } from "@presentation-skill-pack/core";

const VALID_LAYOUTS = new Set([
  "title",
  "two-column",
  "feature-grid",
  "quote",
  "data-table",
  "stat-row",
  "timeline",
  "section",
  "closing",
]);

function structuralValidateDeckJson(json: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    return { valid: false, errors: [`Invalid JSON: ${(err as Error).message}`] };
  }
  const errors: string[] = [];
  if (typeof parsed !== "object" || parsed === null) {
    errors.push("/ must be an object");
    return { valid: false, errors };
  }
  const obj = parsed as Record<string, unknown>;
  if (obj["type"] !== "deck") errors.push('/type must be "deck"');
  if (!Array.isArray(obj["slides"]) || (obj["slides"] as unknown[]).length === 0) {
    errors.push("/slides must be a non-empty array");
    return { valid: errors.length === 0, errors };
  }
  for (let i = 0; i < (obj["slides"] as unknown[]).length; i++) {
    const slide = (obj["slides"] as unknown[])[i] as Record<string, unknown>;
    if (typeof slide !== "object" || slide === null) {
      errors.push(`/slides/${i} must be an object`);
      continue;
    }
    if (typeof slide["layout"] !== "string") {
      errors.push(`/slides/${i}/layout must be a string`);
    } else if (!VALID_LAYOUTS.has(slide["layout"])) {
      errors.push(
        `/slides/${i}/layout "${slide["layout"]}" is not one of: ${[...VALID_LAYOUTS].join(", ")}`
      );
    }
  }
  return { valid: errors.length === 0, errors };
}

function safeValidateDeckJson(json: string): ValidationResult {
  try {
    return coreValidateDeckJson(json);
  } catch {
    return structuralValidateDeckJson(json);
  }
}

export interface RenderOptions {
  themesDir?: string;
  extraCss?: string;
  /**
   * Append a small, theme-aware "Made with presentation-skill-pack" footer to
   * the rendered deck. Defaults to `true`. Set to `false` to omit it.
   */
  attribution?: boolean;
}

const ATTRIBUTION_URL = "https://presentation-skill-pack.vercel.app/?ref=deck";

const ATTRIBUTION_HTML =
  `<footer class="psp-attribution">Made with ` +
  `<a href="${ATTRIBUTION_URL}" target="_blank" rel="noopener">presentation-skill-pack</a>` +
  `</footer>`;

const ATTRIBUTION_CSS = `
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
@media print { .psp-attribution { opacity: 0.5; } }`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);

export function getBundledThemesDir(): string {
  const coreMain = require.resolve("@presentation-skill-pack/core");
  return join(dirname(coreMain), "..", "themes");
}

function getSharedDir(): string {
  return resolve(__dirname, "..", "..", "shared");
}

function buildGoogleFontsUrl(families: string[]): string {
  if (families.length === 0) return "";
  const joined = families.join("&family=");
  return `https://fonts.googleapis.com/css2?family=${joined}&display=swap`;
}

interface SlideData {
  layout: string;
  eyebrow?: string;
  heading?: string;
  lead?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  quote?: string;
  by?: string;
  number?: string;
  columns?: number | string[];
  cards?: Array<{ icon?: string; title: string; body?: string }>;
  rows?: Array<string[]>;
  stats?: Array<{ value: string; label: string }>;
  steps?: Array<{ title: string; body?: string }>;
  cta?: { label?: string; href?: string };
  [key: string]: unknown;
}

interface DeckJson {
  type: "deck";
  meta?: {
    title?: string;
    company?: string;
    description?: string;
    theme?: string;
  };
  slides: SlideData[];
}

function normalizeSlideData(slide: SlideData): Record<string, unknown> {
  const out: Record<string, unknown> = { ...slide };

  if (slide.layout === "data-table" && Array.isArray(slide.rows)) {
    out["rows"] = slide.rows.map((row) => ({ cells: row }));
  }

  if (slide.layout === "feature-grid") {
    if (typeof slide.columns === "number") {
      out["columns"] = slide.columns;
    } else if (!slide.columns) {
      out["columns"] = 3;
    }
  }

  return out;
}

async function renderSlide(slide: SlideData, layoutsDir: string): Promise<string> {
  const layoutName = slide.layout;
  const templatePath = join(layoutsDir, `${layoutName}.html`);
  const template = await readFile(templatePath, "utf-8");
  const data = normalizeSlideData(slide);
  return Mustache.render(template, data);
}

export async function renderDeck(deckJson: string, opts?: RenderOptions): Promise<string> {
  const validation = safeValidateDeckJson(deckJson);
  if (!validation.valid) {
    throw new Error(
      `Deck JSON is invalid:\n${validation.errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }

  const deck = JSON.parse(deckJson) as DeckJson;
  const themeName = deck.meta?.theme ?? "default-tech";
  const themesDir = opts?.themesDir ?? getBundledThemesDir();
  const theme = await loadTheme(themeName, { themesDir });

  const googleFontsUrl = buildGoogleFontsUrl(theme.typography.googleFonts);

  const sharedDir = getSharedDir();
  const baseCssTemplate = await readFile(join(sharedDir, "base.css"), "utf-8");

  const tokenView: Record<string, string> = {
    bg: theme.palette.bg,
    bg2: theme.palette.bg2,
    text: theme.palette.text,
    muted: theme.palette.muted,
    accent: theme.palette.accent,
    accent2: theme.palette.accent2,
    cardBg: theme.palette.cardBg,
    border: theme.palette.border,
    radius: theme.geometry.radius,
    slideW: theme.geometry.slideWidth,
    headingFont: theme.typography.headingFont,
    bodyFont: theme.typography.bodyFont,
    headingWeight: String(theme.typography.headingWeight),
  };

  const renderedCss = Mustache.render(baseCssTemplate, tokenView);

  let fullCss = googleFontsUrl
    ? `@import url('${googleFontsUrl}');\n\n${renderedCss}`
    : renderedCss;

  const attributionEnabled = opts?.attribution !== false;
  if (attributionEnabled) {
    fullCss += `\n\n${ATTRIBUTION_CSS}`;
  }

  if (opts?.extraCss) {
    fullCss += `\n\n${opts.extraCss}`;
  }

  const layoutsDir = join(sharedDir, "layouts");
  const slideParts = await Promise.all(
    deck.slides.map((slide) => renderSlide(slide, layoutsDir))
  );
  const slidesHtml = slideParts.join("\n");

  const documentTemplate = await readFile(join(sharedDir, "document.html"), "utf-8");

  const title = deck.meta?.title ?? deck.meta?.company ?? "Presentation";
  const description = deck.meta?.description ?? "";

  const html = Mustache.render(documentTemplate, {
    title,
    description,
    styles: fullCss,
    slides: slidesHtml,
    attribution: attributionEnabled ? ATTRIBUTION_HTML : "",
  });

  return html;
}

export interface PptxRenderOptions {
  themesDir?: string;
  /** Append the attribution note to the final slide. Defaults to `true`. */
  attribution?: boolean;
  /** Called for content that couldn't be mapped exactly (e.g. remote images). */
  onWarn?: (msg: string) => void;
}

/**
 * Render a deck JSON spec to a native, editable PowerPoint (.pptx) Buffer.
 * Shares validation and theme resolution with {@link renderDeck}. The resulting
 * file opens directly in PowerPoint and Keynote, and imports into Google Slides.
 */
export async function renderDeckPptx(
  deckJson: string,
  opts?: PptxRenderOptions
): Promise<Buffer> {
  const validation = safeValidateDeckJson(deckJson);
  if (!validation.valid) {
    throw new Error(
      `Deck JSON is invalid:\n${validation.errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }

  const deck = JSON.parse(deckJson) as DeckJson;
  const themeName = deck.meta?.theme ?? "default-tech";
  const themesDir = opts?.themesDir ?? getBundledThemesDir();
  const theme = await loadTheme(themeName, { themesDir });

  return deckToPptxBuffer(deck as unknown as ExportDeckJson, theme, {
    attribution: opts?.attribution,
    onWarn: opts?.onWarn,
  });
}
