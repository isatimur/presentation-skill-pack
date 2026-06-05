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
}

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
  });

  return html;
}
