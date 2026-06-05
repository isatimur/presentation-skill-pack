#!/usr/bin/env node
import { createInterface } from "node:readline";
import { readFileSync, mkdirSync, writeFileSync, existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { Command } from "commander";
import Mustache from "mustache";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const NAME_RE = /^[a-z][a-z0-9-]*$/;

export function validateThemeName(name: string): void {
  if (!NAME_RE.test(name)) {
    throw new Error(
      `Invalid theme name "${name}". ` +
        `Name must be kebab-case, start with a lowercase letter, and contain only [a-z0-9-].`
    );
  }
}

export function toUnderscored(name: string): string {
  return name.replace(/-/g, "_");
}

/** Locate the template directory — works in both dist/ and src/ layouts. */
function getTemplateDir(): string {
  const candidates = [
    join(__dirname, "template"),
    join(__dirname, "..", "src", "template"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error(
    `Template directory not found. Searched:\n${candidates.map((p) => `  ${p}`).join("\n")}`
  );
}

export function renderTemplate(templateDir: string, filename: string, view: Record<string, unknown>): string {
  const src = readFileSync(join(templateDir, filename), "utf-8");
  return Mustache.render(src, view);
}

interface ThemeView {
  name: string;
  underscored: string;
  description: string;
  vibe: string;
  author: string;
  license: string;
  bg: string;
  bg2: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  cardBg: string;
  border: string;
  headingFont: string;
  bodyFont: string;
  headingWeight: number | string;
  headingFontSpec: string;
  bodyFontSpec: string;
  radius: string;
}

function prompt(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function ask(
  rl: ReturnType<typeof createInterface>,
  label: string,
  defaultValue?: string
): Promise<string> {
  const hint = defaultValue !== undefined ? ` [${defaultValue}]` : "";
  const raw = await prompt(rl, `  ${label}${hint}: `);
  const value = raw === "" && defaultValue !== undefined ? defaultValue : raw;
  return value;
}

async function collectView(rl: ReturnType<typeof createInterface>, name: string): Promise<ThemeView> {
  process.stdout.write("\nTheme details (press Enter to accept defaults):\n\n");

  const description = await ask(rl, "Description", `A ${name} theme for presentation-skill-pack`);
  const vibe = await ask(rl, "Vibe (e.g. dark, minimal, vibrant)", "dark");
  const author = await ask(rl, "Author name", "");
  const license = await ask(rl, "License", "MIT");

  process.stdout.write("\nPalette (hex or CSS color values):\n");
  const bg = await ask(rl, "bg (slide background)", "#0f172a");
  const bg2 = await ask(rl, "bg2 (secondary background)", "#1e293b");
  const text = await ask(rl, "text (primary text)", "#f8fafc");
  const muted = await ask(rl, "muted (secondary text)", "#94a3b8");
  const accent = await ask(rl, "accent (primary accent)", "#6366f1");
  const accent2 = await ask(rl, "accent2 (secondary accent)", "#a78bfa");
  const cardBg = await ask(rl, "cardBg (card / surface background)", "#1e293b");
  const border = await ask(rl, "border (border color)", "#334155");

  process.stdout.write("\nTypography:\n");
  const headingFont = await ask(rl, "Heading font family (Google Fonts name)", "Inter");
  const bodyFont = await ask(rl, "Body font family (Google Fonts name)", "Inter");
  const headingWeightRaw = await ask(rl, "Heading font weight", "700");
  const headingWeight = parseInt(headingWeightRaw, 10) || 700;

  const headingFontSpec = await ask(
    rl,
    "Heading Google Fonts spec (e.g. Inter:wght@700)",
    `${headingFont}:wght@${headingWeight}`
  );
  const bodyFontSpec = await ask(
    rl,
    "Body Google Fonts spec (e.g. Inter:wght@400;500)",
    `${bodyFont}:wght@400;500`
  );

  process.stdout.write("\nGeometry:\n");
  const radius = await ask(rl, "Border radius", "16px");

  return {
    name,
    underscored: toUnderscored(name),
    description,
    vibe,
    author,
    license,
    bg,
    bg2,
    text,
    muted,
    accent,
    accent2,
    cardBg,
    border,
    headingFont,
    bodyFont,
    headingWeight,
    headingFontSpec,
    bodyFontSpec,
    radius,
  };
}

export function buildProgram(): Command {
  const program = new Command();

  program
    .name("create-presentation-theme")
    .description("Scaffold a new presentation-skill-pack theme package.")
    .argument("<name>", "Theme name in kebab-case (e.g. my-brand-dark)")
    .option(
      "--output-dir <path>",
      "Output directory for the scaffolded theme package"
    )
    .action(async (name: string, options: { outputDir?: string }) => {
      try {
        validateThemeName(name);
      } catch (err) {
        process.stderr.write(`Error: ${(err as Error).message}\n`);
        process.exit(1);
      }

      const outputDir = resolve(
        process.cwd(),
        options.outputDir ?? join("packages", "themes", name)
      );

      process.stdout.write(`\nScaffolding theme: ${name}\n`);
      process.stdout.write(`Output:            ${outputDir}\n`);

      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      let view: ThemeView;
      try {
        view = await collectView(rl, name);
      } finally {
        rl.close();
      }

      const templateDir = getTemplateDir();

      mkdirSync(outputDir, { recursive: true });

      const files: Array<{ template: string; output: string }> = [
        { template: "theme.json.mustache", output: "theme.json" },
        { template: "package.json.mustache", output: "package.json" },
        { template: "pyproject.toml.mustache", output: "pyproject.toml" },
        { template: "README.md.mustache", output: "README.md" },
      ];

      for (const { template, output } of files) {
        const rendered = renderTemplate(templateDir, template, view as unknown as Record<string, unknown>);
        const outPath = join(outputDir, output);
        writeFileSync(outPath, rendered, "utf-8");
        process.stdout.write(`  created  ${output}\n`);
      }

      process.stdout.write(`\nTheme "${name}" scaffolded successfully!\n`);
      process.stdout.write(`\nNext steps:\n`);
      process.stdout.write(`  cd ${outputDir}\n`);
      process.stdout.write(`  npm publish --access public\n`);
    });

  return program;
}

// Only run the CLI when this file is the direct entry point.
// Guarded so vitest can import the exports without triggering commander.
if (process.argv[1] && realpathSync(process.argv[1]) === __filename) {
  buildProgram()
    .parseAsync(process.argv)
    .catch((err: unknown) => {
      process.stderr.write(`Fatal: ${(err as Error).message}\n`);
      process.exit(1);
    });
}
