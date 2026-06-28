/**
 * Deck/slide shape, mirroring `packages/core/deck.schema.json`.
 *
 * The schema in core is the single source of truth for *validation*; these
 * types describe the same shape for the exporter so it can map fields to
 * native slide shapes without re-parsing JSON. Validation stays in core
 * (`validateDeckJson`) and is run by callers (CLI / MCP / studio) before export.
 */

export type LayoutType =
  | "title"
  | "two-column"
  | "feature-grid"
  | "quote"
  | "data-table"
  | "stat-row"
  | "timeline"
  | "section"
  | "closing";

export interface Card {
  icon?: string;
  title: string;
  body?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Step {
  title: string;
  body?: string;
}

export interface Cta {
  label?: string;
  href?: string;
}

export interface Slide {
  layout: LayoutType | string;
  eyebrow?: string;
  heading?: string;
  lead?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  quote?: string;
  by?: string;
  number?: string;
  /** feature-grid: column count (2-4). data-table: header labels. */
  columns?: number | string[];
  cards?: Card[];
  rows?: string[][];
  stats?: Stat[];
  steps?: Step[];
  cta?: Cta;
  [key: string]: unknown;
}

export interface DeckMeta {
  title?: string;
  company?: string;
  description?: string;
  theme?: string;
}

export interface DeckJson {
  type: "deck";
  meta?: DeckMeta;
  slides: Slide[];
}
