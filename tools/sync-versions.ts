#!/usr/bin/env tsx
/**
 * sync-versions — reads the version from packages/core/package.json and
 * writes it to every other package and theme package.json in the monorepo.
 *
 * Run via: pnpm sync-versions
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync } from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
}

function writeJson(filePath: string, data: Record<string, unknown>): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function collectPackageJsonPaths(dir: string, depth = 0): string[] {
  if (depth > 2) return [];
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // recurse into packages/* and packages/themes/*
      results.push(...collectPackageJsonPaths(full, depth + 1));
    } else if (entry === "package.json") {
      results.push(full);
    }
  }
  return results;
}

// Read source-of-truth version from core
const corePkgPath = join(root, "packages", "core", "package.json");
const corePkg = readJson(corePkgPath);
const targetVersion = corePkg["version"] as string;

if (!targetVersion) {
  console.error("Could not read version from packages/core/package.json");
  process.exit(1);
}

console.log(`Syncing all packages to version ${targetVersion} (from core)\n`);

const packagesDir = join(root, "packages");
const allPackageJsons = collectPackageJsonPaths(packagesDir);

let updatedCount = 0;
let skippedCount = 0;

for (const pkgPath of allPackageJsons) {
  // Skip core itself — it's the source of truth
  if (pkgPath === corePkgPath) continue;

  const pkg = readJson(pkgPath);
  const current = pkg["version"] as string | undefined;

  if (current === targetVersion) {
    console.log(`  unchanged  ${relative(root, pkgPath)}`);
    skippedCount++;
    continue;
  }

  pkg["version"] = targetVersion;
  writeJson(pkgPath, pkg);
  console.log(`  updated    ${relative(root, pkgPath)}  (${current ?? "none"} → ${targetVersion})`);
  updatedCount++;
}

console.log(`\nDone. ${updatedCount} updated, ${skippedCount} already at ${targetVersion}.`);
