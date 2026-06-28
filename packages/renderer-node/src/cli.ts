#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { Command } from "commander";
import { renderDeck, renderDeckPptx, getBundledThemesDir } from "./index.js";
import { discoverInstalledThemes } from "@presentation-skill-pack/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

const program = new Command();

const pkgPath = join(__dirname, "..", "package.json");
let version = "0.1.0";
try {
  const pkg = JSON.parse(require("fs").readFileSync(pkgPath, "utf-8")) as { version: string };
  version = pkg.version;
} catch {
  // fallback
}

program
  .name("presentation-skill-pack-render")
  .description("Render a deck JSON spec to a self-contained HTML slide deck.")
  .version(version)
  .argument("[deck.json]", "path to deck JSON file (reads stdin if omitted)")
  .option("-o, --output <path>", "output file (default: deck.html or deck.pptx)")
  .option("-f, --format <fmt>", "output format: html | pptx", "html")
  .option("-t, --theme <name>", "theme name (overrides deck meta.theme)")
  .option("--list-themes", "list available themes and exit")
  .option("--validate", "validate only, do not render")
  .action(async (inputPath: string | undefined, options: {
    output?: string;
    format: string;
    theme?: string;
    listThemes?: boolean;
    validate?: boolean;
  }) => {
    if (options.listThemes) {
      const themesDir = getBundledThemesDir();
      const themes = await discoverInstalledThemes({ bundledThemesDir: themesDir });
      if (themes.length === 0) {
        process.stdout.write("No themes found.\n");
      } else {
        for (const t of themes) {
          process.stdout.write(`${t.name}@${t.version} [${t.source}]\n`);
        }
      }
      return;
    }

    let deckJson: string;
    if (inputPath) {
      const resolved = resolve(process.cwd(), inputPath);
      deckJson = await readFile(resolved, "utf-8");
    } else {
      deckJson = await readStdin();
    }

    if (options.validate) {
      const { validateDeckJson } = await import("./index.js");
      const result = validateDeckJson(deckJson);
      if (result.valid) {
        process.stdout.write("Valid deck JSON.\n");
        process.exit(0);
      } else {
        process.stderr.write(`Invalid deck JSON:\n${result.errors.map((e) => `  - ${e}`).join("\n")}\n`);
        process.exit(1);
      }
    }

    if (options.theme) {
      const parsed = JSON.parse(deckJson) as { meta?: { theme?: string } };
      parsed.meta = { ...parsed.meta, theme: options.theme };
      deckJson = JSON.stringify(parsed);
    }

    const format = options.format.toLowerCase();
    if (format !== "html" && format !== "pptx") {
      process.stderr.write(`Error: unknown format "${options.format}" (expected html | pptx)\n`);
      process.exit(1);
    }

    const defaultOutput = format === "pptx" ? "deck.pptx" : "deck.html";
    const outputPath = resolve(process.cwd(), options.output ?? defaultOutput);

    try {
      if (format === "pptx") {
        const buffer = await renderDeckPptx(deckJson, {
          onWarn: (msg) => process.stderr.write(`  warning: ${msg}\n`),
        });
        await writeFile(outputPath, buffer);
      } else {
        const html = await renderDeck(deckJson, {});
        await writeFile(outputPath, html, "utf-8");
      }
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }

    process.stdout.write(`Rendered → ${outputPath}\n`);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  process.stderr.write(`Fatal: ${(err as Error).message}\n`);
  process.exit(1);
});
