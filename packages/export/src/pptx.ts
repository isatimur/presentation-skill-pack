/**
 * pptxgenjs interop shim.
 *
 * pptxgenjs is a CommonJS package whose `.d.ts` merges a class with an ambient
 * namespace under a single `export default`. Under `moduleResolution: NodeNext`,
 * TypeScript resolves the default import to the *module namespace*, so the real
 * constructor sits at `.default` for the type-checker. At runtime, however, the
 * default import already *is* the class (both the CJS and ES builds export the
 * class directly with no `.default`). The `?? PptxNs` fallback reconciles both:
 * types come from `.default`, runtime falls back to the class itself.
 *
 * All pptxgenjs types are derived structurally here so the rest of the package
 * never has to touch the namespace.
 */
import PptxNs from "pptxgenjs";

type PptxCtor = typeof PptxNs.default;

export const PptxGenJS: PptxCtor =
  ((PptxNs as { default?: PptxCtor }).default ?? (PptxNs as unknown as PptxCtor)) as PptxCtor;

export type Pptx = InstanceType<PptxCtor>;
export type PptxSlide = ReturnType<Pptx["addSlide"]>;
export type PptxTextOpts = NonNullable<Parameters<PptxSlide["addText"]>[1]>;
export type PptxShapeArg = Parameters<PptxSlide["addShape"]>[0];
export type PptxTableRow = Parameters<PptxSlide["addTable"]>[0][number];
