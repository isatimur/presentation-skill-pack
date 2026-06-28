import type { ResolvedTheme } from "@presentation-skill-pack/core";
import { PptxGenJS, type Pptx } from "./pptx.js";
import { buildContext } from "./context.js";
import { renderSlide } from "./layouts.js";
import type { DeckJson } from "./deck-types.js";

export type {
  DeckJson,
  DeckMeta,
  Slide,
  LayoutType,
  Card,
  Stat,
  Step,
  Cta,
} from "./deck-types.js";

const ATTRIBUTION_TEXT = "Made with presentation-skill-pack";
const ATTRIBUTION_URL = "https://presentation-skill-pack.vercel.app/?ref=pptx";

export interface PptxOptions {
  /** Called for any content that couldn't be mapped exactly (e.g. remote images). */
  onWarn?: (msg: string) => void;
  /** Append a small attribution note to the final slide. Defaults to `true`. */
  attribution?: boolean;
}

export interface BuildResult {
  pptx: Pptx;
  slideCount: number;
  warnings: string[];
}

const LAYOUT_NAME = "PSP_16x9";

/**
 * Build a PptxGenJS presentation from a (validated) deck and a resolved theme.
 * Pure and runtime-agnostic — callers serialize via the `deckToPptx*` helpers
 * or `result.pptx.write(...)` directly.
 */
export async function buildPptx(
  deck: DeckJson,
  theme: ResolvedTheme,
  opts: PptxOptions = {}
): Promise<BuildResult> {
  const warnings: string[] = [];
  const warn = (msg: string): void => {
    warnings.push(msg);
    opts.onWarn?.(msg);
  };

  const pptx = new PptxGenJS();
  const ctx = buildContext(
    theme,
    { roundRect: pptx.ShapeType.roundRect, oval: pptx.ShapeType.ellipse },
    warn
  );

  pptx.defineLayout({ name: LAYOUT_NAME, width: ctx.width, height: ctx.height });
  pptx.layout = LAYOUT_NAME;

  if (deck.meta?.title) pptx.title = deck.meta.title;
  if (deck.meta?.company) pptx.company = deck.meta.company;
  if (deck.meta?.description) pptx.subject = deck.meta.description;
  pptx.author = "presentation-skill-pack";

  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  slides.forEach((slideData, i) => {
    const slide = pptx.addSlide();
    renderSlide(slide, ctx, slideData);

    const isLast = i === slides.length - 1;
    if (isLast && opts.attribution !== false) {
      slide.addText(ATTRIBUTION_TEXT, {
        x: ctx.margin,
        y: ctx.height - 0.4,
        w: ctx.width - ctx.margin * 2,
        h: 0.3,
        fontFace: ctx.fonts.body,
        color: ctx.colors.muted,
        fontSize: 9,
        align: "center",
        valign: "middle",
        hyperlink: { url: ATTRIBUTION_URL },
      });
    }
  });

  return { pptx, slideCount: slides.length, warnings };
}

/** Serialize the deck to a PPTX ArrayBuffer (works in Node and the browser). */
export async function deckToPptxArrayBuffer(
  deck: DeckJson,
  theme: ResolvedTheme,
  opts?: PptxOptions
): Promise<ArrayBuffer> {
  const { pptx } = await buildPptx(deck, theme, opts);
  return (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
}

/** Serialize to a Node Buffer (server/CLI). */
export async function deckToPptxBuffer(
  deck: DeckJson,
  theme: ResolvedTheme,
  opts?: PptxOptions
): Promise<Buffer> {
  const { pptx } = await buildPptx(deck, theme, opts);
  return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}

/** Serialize to a Blob (browser/studio download). */
export async function deckToPptxBlob(
  deck: DeckJson,
  theme: ResolvedTheme,
  opts?: PptxOptions
): Promise<Blob> {
  const { pptx } = await buildPptx(deck, theme, opts);
  return (await pptx.write({ outputType: "blob" })) as Blob;
}
