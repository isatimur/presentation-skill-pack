import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export interface Palette {
  bg: string;
  bg2: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  cardBg: string;
  border: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  headingWeight: string | number;
  googleFonts: string[];
}

export interface Geometry {
  radius: string;
  slideWidth: string;
}

export interface ThemeManifest {
  name: string;
  version: string;
  extends?: string;
  description?: string;
  vibe?: string;
  roles?: Partial<Palette>;
  typography?: Partial<Typography>;
  geometry?: Partial<Geometry>;
}

export interface ResolvedTheme {
  name: string;
  version: string;
  manifest: ThemeManifest;
  palette: Palette;
  typography: Typography;
  geometry: Geometry;
}

export interface LoadOptions {
  themesDir: string;
}

const DEFAULT_PALETTE: Palette = {
  bg: "#0e0e12",
  bg2: "#16161d",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  accent: "#7c3aed",
  accent2: "#22d3ee",
  cardBg: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)"
};

const DEFAULT_TYPOGRAPHY: Typography = {
  headingFont: "'Montserrat', system-ui, sans-serif",
  bodyFont: "'Open Sans', system-ui, sans-serif",
  headingWeight: 800,
  googleFonts: ["Montserrat:wght@700;800", "Open+Sans:wght@400;600"]
};

const DEFAULT_GEOMETRY: Geometry = {
  radius: "18px",
  slideWidth: "1280px"
};

async function readManifest(themesDir: string, name: string): Promise<ThemeManifest> {
  const raw = await readFile(join(themesDir, name, "theme.json"), "utf-8");
  return JSON.parse(raw) as ThemeManifest;
}

export async function loadTheme(name: string, opts: LoadOptions): Promise<ResolvedTheme> {
  const chain: ThemeManifest[] = [];
  let current: string | undefined = name;
  const seen = new Set<string>();

  while (current && !seen.has(current)) {
    seen.add(current);
    const manifest = await readManifest(opts.themesDir, current);
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

  const top = chain[chain.length - 1]!;
  return { name: top.name, version: top.version, manifest: top, palette, typography, geometry };
}

export interface DiscoveredTheme {
  name: string;
  version: string;
  manifest: ThemeManifest;
  source: "bundled" | "installed";
}

export interface DiscoveryOptions {
  bundledThemesDir: string;
  nodeModulesRoot?: string;
}

export async function discoverInstalledThemes(
  opts: DiscoveryOptions
): Promise<DiscoveredTheme[]> {
  const out: DiscoveredTheme[] = [];

  async function scan(dir: string, source: DiscoveredTheme["source"]): Promise<void> {
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const themePath = join(dir, entry, "theme.json");
      try {
        if (!(await stat(themePath)).isFile()) continue;
        const manifest = JSON.parse(await readFile(themePath, "utf-8")) as ThemeManifest;
        out.push({ name: manifest.name, version: manifest.version, manifest, source });
      } catch {
        /* not a theme dir */
      }
    }
  }

  await scan(opts.bundledThemesDir, "bundled");
  if (opts.nodeModulesRoot) {
    await scan(join(opts.nodeModulesRoot, "node_modules", "@presentation-skill-pack"), "installed");
  }

  return out;
}
