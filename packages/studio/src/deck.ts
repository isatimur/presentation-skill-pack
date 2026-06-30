import type { DeckJson, Slide, LayoutType } from "@presentation-skill-pack/export";

export type { DeckJson, Slide, LayoutType };

export const LAYOUTS: LayoutType[] = [
  "title",
  "section",
  "two-column",
  "feature-grid",
  "data-table",
  "stat-row",
  "timeline",
  "quote",
  "closing",
];

export const LAYOUT_LABELS: Record<LayoutType, string> = {
  title: "Title",
  section: "Section divider",
  "two-column": "Two column",
  "feature-grid": "Feature grid",
  "data-table": "Data table",
  "stat-row": "Stat row",
  timeline: "Timeline",
  quote: "Quote",
  closing: "Closing",
};

/** A reasonable starter slide for each layout, so new slides aren't blank. */
export function blankSlide(layout: LayoutType): Slide {
  switch (layout) {
    case "title":
      return { layout, eyebrow: "Eyebrow", heading: "Title slide", lead: "Supporting line." };
    case "section":
      return { layout, number: "01", eyebrow: "Part", heading: "Section title", lead: "" };
    case "two-column":
      return { layout, heading: "Heading", body: "Left column body text.", image: "", imageAlt: "Image" };
    case "feature-grid":
      return {
        layout,
        heading: "Feature grid",
        columns: 3,
        cards: [
          { title: "One", body: "First point." },
          { title: "Two", body: "Second point." },
          { title: "Three", body: "Third point." },
        ],
      };
    case "data-table":
      return { layout, heading: "Table", columns: ["Column A", "Column B"], rows: [["a1", "b1"], ["a2", "b2"]] };
    case "stat-row":
      return { layout, heading: "Stats", stats: [{ value: "100%", label: "Metric" }, { value: "2x", label: "Metric" }] };
    case "timeline":
      return { layout, heading: "Timeline", steps: [{ title: "Step one", body: "Detail." }, { title: "Step two", body: "Detail." }] };
    case "quote":
      return { layout, quote: "A memorable quote.", by: "Attribution" };
    case "closing":
      return { layout, eyebrow: "Thanks", heading: "Closing", lead: "Call to action.", cta: { label: "Get started", href: "https://example.com" } };
    default:
      return { layout, heading: "Slide" };
  }
}

export const EXAMPLE_DECK: DeckJson = {
  type: "deck",
  meta: { title: "Acme Q3", company: "Acme", theme: "claude" },
  slides: [
    { layout: "title", eyebrow: "Q3 2026", heading: "Acme All-Hands", lead: "Momentum, metrics, and what's next." },
    { layout: "section", number: "01", eyebrow: "Part one", heading: "Where we are" },
    {
      layout: "feature-grid",
      heading: "Three pillars",
      columns: 3,
      cards: [
        { icon: "fa-solid fa-bolt", title: "Speed", body: "Ship 3x faster." },
        { title: "Safety", body: "SOC2 in progress." },
        { title: "Simplicity", body: "One command." },
      ],
    },
    { layout: "stat-row", heading: "By the numbers", stats: [
      { value: "98%", label: "Uptime" }, { value: "$1.2M", label: "ARR" }, { value: "3.1x", label: "YoY" },
    ] },
    { layout: "data-table", heading: "Pipeline", columns: ["Stage", "Count", "Value"], rows: [
      ["Lead", "120", "$600k"], ["POC", "34", "$340k"], ["Closed", "12", "$210k"],
    ] },
    { layout: "timeline", heading: "Roadmap", steps: [
      { title: "Now", body: "PPTX export." }, { title: "Next", body: "Studio editor." }, { title: "Later", body: "Templates." },
    ] },
    { layout: "quote", quote: "Make it work, make it right, make it fast.", by: "Kent Beck" },
    { layout: "closing", heading: "Thank you", lead: "Questions?", cta: { label: "Get started", href: "https://acme.com" } },
  ],
};
