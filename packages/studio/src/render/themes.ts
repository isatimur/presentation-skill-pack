import type {
  ResolvedTheme,
  ThemeManifest,
  Palette,
  Typography,
  Geometry,
} from "@presentation-skill-pack/core";

/**
 * Browser theme registry. Bundles every `theme.json` in the monorepo (core +
 * themes packages) at build time and resolves the `extends` chain in-memory —
 * a fs-free port of core's `loadTheme`, so the studio stays a static SPA.
 */

const DEFAULT_PALETTE: Palette = {
  bg: "#0e0e12",
  bg2: "#16161d",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  accent: "#7c3aed",
  accent2: "#22d3ee",
  cardBg: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
};

const DEFAULT_TYPOGRAPHY: Typography = {
  headingFont: "'Montserrat', system-ui, sans-serif",
  bodyFont: "'Open Sans', system-ui, sans-serif",
  headingWeight: 800,
  googleFonts: ["Montserrat:wght@700;800", "Open+Sans:wght@400;600"],
};

const DEFAULT_GEOMETRY: Geometry = {
  radius: "18px",
  slideWidth: "1280px",
};

const manifestModules = {
  ...import.meta.glob("../../../core/themes/*/theme.json", { eager: true }),
  ...import.meta.glob("../../../themes/*/theme.json", { eager: true }),
} as Record<string, { default: ThemeManifest } | ThemeManifest>;

const REGISTRY = new Map<string, ThemeManifest>();
for (const mod of Object.values(manifestModules)) {
  const manifest = ("default" in mod ? mod.default : mod) as ThemeManifest;
  if (manifest?.name) REGISTRY.set(manifest.name, manifest);
}

export function listThemeNames(): string[] {
  return [...REGISTRY.keys()].sort();
}

export function resolveTheme(name: string): ResolvedTheme {
  const chain: ThemeManifest[] = [];
  let current: string | undefined = REGISTRY.has(name) ? name : "default-tech";
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    seen.add(current);
    const manifest = REGISTRY.get(current);
    if (!manifest) break;
    chain.unshift(manifest);
    current = manifest.extends;
  }

  const palette = { ...DEFAULT_PALETTE };
  const typography = { ...DEFAULT_TYPOGRAPHY };
  const geometry = { ...DEFAULT_GEOMETRY };
  for (const m of chain) {
    Object.assign(palette, m.roles ?? {});
    Object.assign(typography, m.typography ?? {});
    Object.assign(geometry, m.geometry ?? {});
  }

  const top = chain[chain.length - 1] ?? {
    name: "default-tech",
    version: "0.0.0",
  };
  return { name: top.name, version: top.version, manifest: top, palette, typography, geometry };
}
