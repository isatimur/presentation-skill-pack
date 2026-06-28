/**
 * Font utilities.
 *
 * Theme typography stores CSS font stacks like `'Montserrat', system-ui, sans-serif`.
 * PowerPoint wants a single face name; it substitutes a local font if the named
 * family isn't installed. We extract the first concrete family from the stack.
 * (Fidelity note: web fonts won't render identically in Office unless installed —
 * documented in references/pptx-fidelity.md.)
 */

export function parseFontFamily(cssFont: string): string {
  const first = cssFont.split(",")[0]?.trim() ?? "";
  const unquoted = first.replace(/^['"]|['"]$/g, "").trim();
  // Skip generic/system keywords if they somehow lead the stack.
  const generic = new Set([
    "system-ui",
    "sans-serif",
    "serif",
    "monospace",
    "ui-sans-serif",
    "ui-serif",
    "ui-monospace",
    "-apple-system",
  ]);
  if (!unquoted || generic.has(unquoted.toLowerCase())) {
    return "Arial";
  }
  return unquoted;
}

export function isBoldWeight(weight: string | number): boolean {
  const n = typeof weight === "number" ? weight : parseInt(weight, 10);
  return Number.isFinite(n) ? n >= 600 : false;
}
