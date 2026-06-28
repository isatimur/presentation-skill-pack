import type { ExportContext } from "./context.js";
import type { Slide } from "./deck-types.js";
import type { PptxSlide, PptxTextOpts, PptxTableRow } from "./pptx.js";

/**
 * Per-layout mappers: each turns a structured slide into native PPTX shapes
 * (text boxes, tables, rounded rectangles) positioned in inches on the slide.
 */

type PSlide = PptxSlide;
type TextOpts = PptxTextOpts;

function eyebrow(slide: PSlide, ctx: ExportContext, text: string, x: number, y: number, w: number): void {
  slide.addText(text.toUpperCase(), {
    x,
    y,
    w,
    h: 0.35,
    fontFace: ctx.fonts.body,
    fontSize: 13,
    bold: true,
    color: ctx.colors.accent2,
    charSpacing: 2,
    align: "left",
    valign: "middle",
  });
}

function heading(slide: PSlide, ctx: ExportContext, text: string, opts: TextOpts): void {
  slide.addText(text, {
    fontFace: ctx.fonts.heading,
    bold: ctx.fonts.headingBold,
    color: ctx.colors.text,
    fit: "shrink",
    valign: "top",
    align: "left",
    ...opts,
  });
}

function body(slide: PSlide, ctx: ExportContext, text: string, opts: TextOpts): void {
  slide.addText(text, {
    fontFace: ctx.fonts.body,
    color: ctx.colors.muted,
    fontSize: 16,
    fit: "shrink",
    valign: "top",
    align: "left",
    lineSpacingMultiple: 1.15,
    ...opts,
  });
}

/** title / closing share a centered hero block. */
function renderHero(slide: PSlide, ctx: ExportContext, data: Slide): void {
  const x = ctx.margin;
  const w = ctx.width - ctx.margin * 2;
  let y = ctx.height * 0.32;

  if (data.eyebrow) {
    eyebrow(slide, ctx, data.eyebrow, x, y, w);
    y += 0.5;
  }
  if (data.heading) {
    heading(slide, ctx, data.heading, { x, y, w, h: 1.8, fontSize: 44 });
    y += 1.9;
  }
  if (data.lead) {
    body(slide, ctx, data.lead, { x, y, w, h: 1.2, fontSize: 20 });
    y += 1.2;
  }
  if (data.cta?.label) {
    const btnW = Math.min(3.2, w);
    slide.addText(data.cta.label, {
      shape: ctx.shapeRoundRect,
      x,
      y: y + 0.1,
      w: btnW,
      h: 0.6,
      fill: { color: ctx.colors.accent },
      color: ctx.colors.bg,
      fontFace: ctx.fonts.body,
      fontSize: 16,
      bold: true,
      align: "center",
      valign: "middle",
      rectRadius: 0.08,
      ...(data.cta.href ? { hyperlink: { url: data.cta.href } } : {}),
    });
  }
}

function renderSection(slide: PSlide, ctx: ExportContext, data: Slide): void {
  const x = ctx.margin;
  const w = ctx.width - ctx.margin * 2;
  if (data.number) {
    slide.addText(data.number, {
      x,
      y: ctx.margin,
      w,
      h: 2,
      fontFace: ctx.fonts.heading,
      bold: true,
      color: ctx.colors.accent,
      fontSize: 96,
      align: "left",
      valign: "top",
    });
  }
  let y = ctx.height * 0.42;
  if (data.eyebrow) {
    eyebrow(slide, ctx, data.eyebrow, x, y, w);
    y += 0.5;
  }
  if (data.heading) {
    heading(slide, ctx, data.heading, { x, y, w, h: 1.6, fontSize: 40 });
    y += 1.7;
  }
  if (data.lead) {
    body(slide, ctx, data.lead, { x, y, w, h: 1.0, fontSize: 18 });
  }
}

function renderHeaderBlock(slide: PSlide, ctx: ExportContext, data: Slide): number {
  const x = ctx.margin;
  const w = ctx.width - ctx.margin * 2;
  let y = ctx.margin;
  if (data.eyebrow) {
    eyebrow(slide, ctx, data.eyebrow, x, y, w);
    y += 0.45;
  }
  if (data.heading) {
    heading(slide, ctx, data.heading, { x, y, w, h: 1.0, fontSize: 30 });
    y += 1.1;
  }
  return y;
}

function renderTwoColumn(slide: PSlide, ctx: ExportContext, data: Slide): void {
  const colGap = 0.5;
  const colW = (ctx.width - ctx.margin * 2 - colGap) / 2;
  const leftX = ctx.margin;
  const rightX = ctx.margin + colW + colGap;
  let y = ctx.margin;

  if (data.eyebrow) {
    eyebrow(slide, ctx, data.eyebrow, leftX, y, colW);
    y += 0.45;
  }
  if (data.heading) {
    heading(slide, ctx, data.heading, { x: leftX, y, w: colW, h: 1.4, fontSize: 30 });
    y += 1.5;
  }
  if (data.body) {
    body(slide, ctx, data.body, { x: leftX, y, w: colW, h: ctx.height - y - ctx.margin, fontSize: 16 });
  }

  const imgY = ctx.margin;
  const imgH = ctx.height - ctx.margin * 2;
  addImageOrPlaceholder(slide, ctx, data, rightX, imgY, colW, imgH);
}

function addImageOrPlaceholder(
  slide: PSlide,
  ctx: ExportContext,
  data: Slide,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const src = data.image;
  if (src && src.startsWith("data:")) {
    try {
      slide.addImage({ data: src, x, y, w, h, sizing: { type: "contain", w, h } });
      return;
    } catch {
      ctx.warn(`Failed to embed inline image; showed placeholder instead.`);
    }
  } else if (src) {
    // Remote/local URLs aren't embedded (no network in the exporter) — placeholder.
    ctx.warn(`Image not embedded (remote images unsupported in export): ${src}`);
  }
  slide.addShape(ctx.shapeRoundRect, {
    x,
    y,
    w,
    h,
    fill: { color: ctx.colors.cardBg },
    line: { color: ctx.colors.border, width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(data.imageAlt || "Image", {
    x,
    y,
    w,
    h,
    fontFace: ctx.fonts.body,
    color: ctx.colors.muted,
    fontSize: 14,
    align: "center",
    valign: "middle",
    italic: true,
  });
}

function renderFeatureGrid(slide: PSlide, ctx: ExportContext, data: Slide): void {
  const top = renderHeaderBlock(slide, ctx, data);
  const cards = data.cards ?? [];
  if (cards.length === 0) return;

  let cols = typeof data.columns === "number" ? data.columns : 3;
  cols = Math.max(1, Math.min(4, cols, cards.length));
  const rows = Math.ceil(cards.length / cols);
  const gap = 0.35;
  const areaX = ctx.margin;
  const areaW = ctx.width - ctx.margin * 2;
  const areaY = top + 0.1;
  const areaH = ctx.height - areaY - ctx.margin;
  const cardW = (areaW - gap * (cols - 1)) / cols;
  const cardH = (areaH - gap * (rows - 1)) / rows;

  cards.forEach((card, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = areaX + c * (cardW + gap);
    const y = areaY + r * (cardH + gap);

    slide.addShape(ctx.shapeRoundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: ctx.colors.cardBg },
      line: { color: ctx.colors.border, width: 1 },
      rectRadius: 0.06,
    });
    // Accent marker (stands in for the icon glyph).
    slide.addShape(ctx.shapeRoundRect, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.32,
      h: 0.32,
      fill: { color: ctx.colors.accent },
      rectRadius: 0.05,
    });
    const pad = 0.2;
    slide.addText(card.title, {
      x: x + pad,
      y: y + 0.6,
      w: cardW - pad * 2,
      h: 0.5,
      fontFace: ctx.fonts.heading,
      bold: true,
      color: ctx.colors.text,
      fontSize: 16,
      fit: "shrink",
      valign: "top",
    });
    if (card.body) {
      slide.addText(card.body, {
        x: x + pad,
        y: y + 1.1,
        w: cardW - pad * 2,
        h: cardH - 1.25,
        fontFace: ctx.fonts.body,
        color: ctx.colors.muted,
        fontSize: 12,
        fit: "shrink",
        valign: "top",
        lineSpacingMultiple: 1.1,
      });
    }
  });
}

function renderDataTable(slide: PSlide, ctx: ExportContext, data: Slide): void {
  const top = renderHeaderBlock(slide, ctx, data);
  const headers = Array.isArray(data.columns) ? data.columns : [];
  const rows = data.rows ?? [];

  const tableRows: PptxTableRow[] = [];
  if (headers.length > 0) {
    tableRows.push(
      headers.map((label) => ({
        text: label,
        options: {
          bold: true,
          color: ctx.colors.bg,
          fill: { color: ctx.colors.accent },
          fontFace: ctx.fonts.heading,
          fontSize: 14,
        },
      }))
    );
  }
  for (const row of rows) {
    tableRows.push(
      row.map((cell) => ({
        text: cell,
        options: { color: ctx.colors.text, fontFace: ctx.fonts.body, fontSize: 13 },
      }))
    );
  }
  if (tableRows.length === 0) return;

  slide.addTable(tableRows, {
    x: ctx.margin,
    y: top + 0.1,
    w: ctx.width - ctx.margin * 2,
    border: { type: "solid", color: ctx.colors.border, pt: 1 },
    align: "left",
    valign: "middle",
    autoPage: false,
    rowH: 0.4,
  });
}

function renderStatRow(slide: PSlide, ctx: ExportContext, data: Slide): void {
  renderHeaderBlock(slide, ctx, data);
  const stats = data.stats ?? [];
  if (stats.length === 0) return;

  const gap = 0.4;
  const areaW = ctx.width - ctx.margin * 2;
  const cellW = (areaW - gap * (stats.length - 1)) / stats.length;
  const y = ctx.height * 0.42;

  stats.forEach((stat, i) => {
    const x = ctx.margin + i * (cellW + gap);
    slide.addText(stat.value, {
      x,
      y,
      w: cellW,
      h: 1.0,
      fontFace: ctx.fonts.heading,
      bold: true,
      color: ctx.colors.accent,
      fontSize: 40,
      align: "center",
      valign: "middle",
      fit: "shrink",
    });
    slide.addText(stat.label, {
      x,
      y: y + 1.05,
      w: cellW,
      h: 0.7,
      fontFace: ctx.fonts.body,
      color: ctx.colors.muted,
      fontSize: 14,
      align: "center",
      valign: "top",
      fit: "shrink",
    });
  });
}

function renderTimeline(slide: PSlide, ctx: ExportContext, data: Slide): void {
  const top = renderHeaderBlock(slide, ctx, data);
  const steps = data.steps ?? [];
  if (steps.length === 0) return;

  const areaY = top + 0.1;
  const areaH = ctx.height - areaY - ctx.margin;
  const stepH = areaH / steps.length;
  const badge = 0.4;
  const x = ctx.margin;

  steps.forEach((step, i) => {
    const y = areaY + i * stepH;
    slide.addShape(ctx.shapeOval, {
      x,
      y: y + 0.05,
      w: badge,
      h: badge,
      fill: { color: ctx.colors.accent },
    });
    slide.addText(String(i + 1), {
      x,
      y: y + 0.05,
      w: badge,
      h: badge,
      fontFace: ctx.fonts.heading,
      bold: true,
      color: ctx.colors.bg,
      fontSize: 14,
      align: "center",
      valign: "middle",
    });
    const textX = x + badge + 0.25;
    const textW = ctx.width - textX - ctx.margin;
    slide.addText(step.title, {
      x: textX,
      y,
      w: textW,
      h: 0.4,
      fontFace: ctx.fonts.heading,
      bold: true,
      color: ctx.colors.text,
      fontSize: 16,
      valign: "middle",
      fit: "shrink",
    });
    if (step.body) {
      slide.addText(step.body, {
        x: textX,
        y: y + 0.4,
        w: textW,
        h: stepH - 0.5,
        fontFace: ctx.fonts.body,
        color: ctx.colors.muted,
        fontSize: 13,
        valign: "top",
        fit: "shrink",
      });
    }
  });
}

function renderQuote(slide: PSlide, ctx: ExportContext, data: Slide): void {
  const x = ctx.margin * 1.5;
  const w = ctx.width - x * 2;
  if (data.quote) {
    slide.addText(`“${data.quote}”`, {
      x,
      y: ctx.height * 0.28,
      w,
      h: 2.4,
      fontFace: ctx.fonts.heading,
      color: ctx.colors.text,
      fontSize: 30,
      italic: true,
      align: "center",
      valign: "middle",
      fit: "shrink",
    });
  }
  if (data.by) {
    slide.addText(`— ${data.by}`, {
      x,
      y: ctx.height * 0.7,
      w,
      h: 0.6,
      fontFace: ctx.fonts.body,
      color: ctx.colors.accent2,
      fontSize: 16,
      bold: true,
      align: "center",
      valign: "top",
    });
  }
}

const RENDERERS: Record<string, (s: PSlide, ctx: ExportContext, d: Slide) => void> = {
  title: renderHero,
  closing: renderHero,
  section: renderSection,
  "two-column": renderTwoColumn,
  "feature-grid": renderFeatureGrid,
  "data-table": renderDataTable,
  "stat-row": renderStatRow,
  timeline: renderTimeline,
  quote: renderQuote,
};

export function renderSlide(slide: PSlide, ctx: ExportContext, data: Slide): void {
  slide.background = { color: ctx.colors.bg };
  const renderer = RENDERERS[data.layout];
  if (!renderer) {
    ctx.warn(`Unknown layout "${data.layout}" — rendered heading/lead only.`);
    renderHero(slide, ctx, data);
    return;
  }
  renderer(slide, ctx, data);
}
