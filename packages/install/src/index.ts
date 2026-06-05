#!/usr/bin/env node
import { existsSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { Command } from "commander";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const VALID_ADAPTERS = [
  "claude-code",
  "cursor",
  "codex",
  "gemini-cli",
  "cli",
] as const;

export type Adapter = (typeof VALID_ADAPTERS)[number];

export function isValidAdapter(adapter: string): adapter is Adapter {
  return (VALID_ADAPTERS as readonly string[]).includes(adapter);
}

function scriptExtension(platform: string): string {
  return platform === "win32" ? "ps1" : "sh";
}

export interface FsOps {
  existsSync: (p: string) => boolean;
  realpathSync: (p: string) => string;
}

/**
 * Resolve the installer shell script for the given adapter and platform.
 *
 * Search order:
 *   1. dist/adapters/<adapter>/install.{sh,ps1}  — published / npx layout
 *   2. ../../../adapters/<adapter>/install.{sh,ps1} — monorepo dev layout
 *
 * The optional `fs` parameter allows injecting test doubles for existsSync/realpathSync.
 */
export function resolveAdapterScript(
  adapter: string,
  platform: string,
  fs: FsOps = { existsSync, realpathSync }
): string {
  if (!isValidAdapter(adapter)) {
    throw new Error(
      `Unknown adapter: "${adapter}". Valid adapters: ${VALID_ADAPTERS.join(", ")}`
    );
  }

  const ext = scriptExtension(platform);
  const scriptName = `install.${ext}`;

  const candidates: string[] = [
    join(__dirname, "adapters", adapter, scriptName),
    join(__dirname, "..", "..", "..", "adapters", adapter, scriptName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.realpathSync(candidate);
    }
  }

  throw new Error(
    `Adapter script not found for "${adapter}" (${platform}). ` +
      `Searched:\n${candidates.map((p) => `  ${p}`).join("\n")}`
  );
}

function resolveCoreDir(): string {
  const require = createRequire(import.meta.url);
  const skillPath = require.resolve("@presentation-skill-pack/core/skill");
  return dirname(skillPath);
}

export function buildProgram(): Command {
  const program = new Command();

  program
    .name("presentation-skill-pack-install")
    .description("Install a presentation-skill-pack adapter into your AI tool of choice.")
    .argument(
      "<adapter>",
      `Adapter to install. One of: ${VALID_ADAPTERS.join(", ")}`
    )
    .option("--lite", "Install in lite mode (skill file only, no full toolchain)")
    .action((adapter: string, options: { lite?: boolean }) => {
      if (!isValidAdapter(adapter)) {
        process.stderr.write(
          `Error: unknown adapter "${adapter}". Valid adapters: ${VALID_ADAPTERS.join(", ")}\n`
        );
        process.exit(1);
      }

      const platform = process.platform;
      const mode = options.lite ? "lite" : "full";

      let script: string;
      try {
        script = resolveAdapterScript(adapter, platform);
      } catch (err) {
        process.stderr.write(`Error: ${(err as Error).message}\n`);
        process.exit(1);
      }

      let coreDir: string;
      try {
        coreDir = resolveCoreDir();
      } catch (err) {
        process.stderr.write(
          `Error: could not resolve @presentation-skill-pack/core — is it installed?\n` +
            `  ${(err as Error).message}\n`
        );
        process.exit(1);
      }

      const env = { ...process.env, PSP_CORE_DIR: coreDir };

      let result: ReturnType<typeof spawnSync>;
      if (platform === "win32") {
        result = spawnSync(
          "powershell",
          ["-ExecutionPolicy", "Bypass", "-File", script, "-Mode", mode],
          { stdio: "inherit", env }
        );
      } else {
        result = spawnSync("bash", [script, mode], { stdio: "inherit", env });
      }

      process.exit(result.status ?? 1);
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
