#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { validateThemeJson } from "./validate-theme.js";

const path = process.argv[2];
if (!path) {
  process.stderr.write("usage: validate-theme <theme.json>\n");
  process.exit(2);
}

const result = validateThemeJson(readFileSync(path, "utf-8"));
if (result.valid) {
  process.stdout.write(`OK: ${path} is a valid theme manifest\n`);
} else {
  process.stderr.write(`INVALID: ${path}\n`);
  for (const e of result.errors) process.stderr.write(`  - ${e}\n`);
  process.exit(1);
}
