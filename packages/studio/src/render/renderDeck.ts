import Mustache from "mustache";
import type { ResolvedTheme } from "@presentation-skill-pack/core";
import type { DeckJson, Slide } from "@presentation-skill-pack/export";
import baseCssTemplate from "../../../shared/base.css?raw";
import documentTemplate from "../../../shared/document.html?raw";

/**
 * Browser-side deck → HTML render. A fs-free port of `@presentation-skill-pack/render`
 * that pulls the shared Mustache layouts and base stylesheet from the monorepo at
 * build time, so the live preview matches the canonical Node renderer output.
 */

const layoutModules = import.meta.glob("../../../shared/layouts/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const LAYOUTS = new Map<string, string>();
for (const [path, tpl] of Object.entries(layoutModules)) {
  const name = path.split("/").pop()!.replace(/\.html$/, "");
  LAYOUTS.set(name, tpl);
}

function buildGoogleFontsUrl(families: string[]): string {
  if (families.length === 0) return "";
  return `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap`;
}

function normalizeSlideData(slide: Slide): Record<string, unknown> {
  const out: Record<string, unknown> = { ...slide };
  if (slide.layout === "data-table" && Array.isArray(slide.rows)) {
    out["rows"] = slide.rows.map((row) => ({ cells: row }));
  }
  if (slide.layout === "feature-grid") {
    if (typeof slide.columns === "number") out["columns"] = slide.columns;
    else if (!slide.columns) out["columns"] = 3;
  }
  return out;
}

const ATTRIBUTION_HTML =
  `<footer class="psp-attribution">Made with ` +
  `<a href="https://presentation-skill-pack.vercel.app/?ref=studio" target="_blank" rel="noopener">presentation-skill-pack</a>` +
  `</footer>`;

const ATTRIBUTION_CSS = `
.psp-attribution { font-family: var(--body-font); font-size: 13px; letter-spacing: 0.04em; color: var(--muted); opacity: 0.6; text-align: center; padding: 4px 0 16px; }
.psp-attribution a { color: var(--muted); text-decoration: none; }`;

export function renderDeckHtml(deck: DeckJson, theme: ResolvedTheme): string {
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
  const googleFontsUrl = buildGoogleFontsUrl(theme.typography.googleFonts);
  let fullCss = googleFontsUrl
    ? `@import url('${googleFontsUrl}');\n\n${renderedCss}`
    : renderedCss;
  fullCss += `\n\n${ATTRIBUTION_CSS}`;

  const slides = (Array.isArray(deck.slides) ? deck.slides : [])
    .map((slide) => {
      const template = LAYOUTS.get(slide.layout);
      if (!template) {
        return `<section class="slide"><h2>Unknown layout: ${slide.layout}</h2></section>`;
      }
      return Mustache.render(template, normalizeSlideData(slide));
    })
    .join("\n");

  const title = deck.meta?.title ?? deck.meta?.company ?? "Presentation";
  return Mustache.render(documentTemplate, {
    title,
    description: deck.meta?.description ?? "",
    styles: fullCss,
    slides,
    attribution: ATTRIBUTION_HTML,
  });
}
