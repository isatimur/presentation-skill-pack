import _Ajv2020 from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { ValidateFunction } from "ajv";

// ajv/dist/2020 ships as a CommonJS default; the ESM interop makes it callable
// as a constructor only via the module object itself.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv2020 = (_Ajv2020 as any).default ?? _Ajv2020;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "deck.schema.json");

let validateFn: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (validateFn) return validateFn;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ajv = new Ajv2020({ allErrors: true, strict: false }) as any;
  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  validateFn = ajv.compile(schema) as ValidateFunction;
  return validateFn;
}

export function validateDeck(deck: unknown): ValidationResult {
  const validate = getValidator();
  const valid = validate(deck);
  const errors = (validate.errors ?? []).map(
    (e) => `${e.instancePath || "/"} ${e.message ?? "invalid"}`
  );
  return { valid, errors };
}

export function validateDeckJson(json: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    return { valid: false, errors: [`Invalid JSON: ${(err as Error).message}`] };
  }
  return validateDeck(parsed);
}
