import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Mustache from "mustache";
import { validateThemeName, toUnderscored, renderTemplate } from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATE_DIR = join(__dirname, "..", "src", "template");

const SAMPLE_VIEW = {
  name: "ocean-dark",
  underscored: "ocean_dark",
  description: "A deep ocean dark theme",
  vibe: "dark",
  author: "Test Author",
  license: "MIT",
  bg: "#0a1628",
  bg2: "#0f2040",
  text: "#e8f4fd",
  muted: "#7fb3d3",
  accent: "#00bcd4",
  accent2: "#4dd0e1",
  cardBg: "#0f2040",
  border: "#1a3a5c",
  headingFont: "Montserrat",
  bodyFont: "Source Sans Pro",
  headingWeight: 700,
  headingFontSpec: "Montserrat:wght@700",
  bodyFontSpec: "Source+Sans+Pro:wght@400;500",
  radius: "12px",
};

describe("renderTemplate — theme.json.mustache", () => {
  it("produces valid JSON containing the correct name and accent color", () => {
    const rendered = renderTemplate(TEMPLATE_DIR, "theme.json.mustache", SAMPLE_VIEW);
    let parsed: Record<string, unknown>;
    expect(() => {
      parsed = JSON.parse(rendered);
    }, "rendered output must be valid JSON").not.toThrow();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect((parsed!["name"] as string)).toBe("ocean-dark");
    expect(((parsed!["roles"] as Record<string, string>)["accent"])).toBe("#00bcd4");
  });

  it("embeds headingWeight as a bare number (not a string)", () => {
    const rendered = renderTemplate(TEMPLATE_DIR, "theme.json.mustache", SAMPLE_VIEW);
    const parsed = JSON.parse(rendered) as { typography: { headingWeight: unknown } };
    expect(typeof parsed.typography.headingWeight).toBe("number");
    expect(parsed.typography.headingWeight).toBe(700);
  });

  it("embeds the correct typography font stacks", () => {
    const rendered = renderTemplate(TEMPLATE_DIR, "theme.json.mustache", SAMPLE_VIEW);
    const parsed = JSON.parse(rendered) as { typography: { headingFont: string; bodyFont: string } };
    expect(parsed.typography.headingFont).toContain("Montserrat");
    expect(parsed.typography.bodyFont).toContain("Source Sans Pro");
  });
});

describe("renderTemplate — package.json.mustache", () => {
  it("produces valid JSON with the correct scoped package name", () => {
    const rendered = renderTemplate(TEMPLATE_DIR, "package.json.mustache", SAMPLE_VIEW);
    const parsed = JSON.parse(rendered) as { name: string };
    expect(parsed.name).toBe("@presentation-skill-pack/theme-ocean-dark");
  });
});

describe("renderTemplate — pyproject.toml.mustache", () => {
  it("uses underscored name in the wheel packages field", () => {
    const rendered = renderTemplate(TEMPLATE_DIR, "pyproject.toml.mustache", SAMPLE_VIEW);
    expect(rendered).toContain("presentation-skill-pack-theme-ocean-dark");
    expect(rendered).toContain("ocean_dark");
  });
});

describe("renderTemplate — README.md.mustache", () => {
  it("contains an install command and palette table", () => {
    const rendered = renderTemplate(TEMPLATE_DIR, "README.md.mustache", SAMPLE_VIEW);
    expect(rendered).toContain("@presentation-skill-pack/theme-ocean-dark");
    expect(rendered).toContain("#00bcd4");
    expect(rendered).toContain("accent");
  });
});

describe("validateThemeName", () => {
  it("accepts valid kebab-case names", () => {
    expect(() => validateThemeName("ocean-dark")).not.toThrow();
    expect(() => validateThemeName("my-brand")).not.toThrow();
    expect(() => validateThemeName("a")).not.toThrow();
    expect(() => validateThemeName("theme123")).not.toThrow();
  });

  it("rejects names with uppercase letters", () => {
    expect(() => validateThemeName("My Theme")).toThrow("Invalid theme name");
    expect(() => validateThemeName("MyTheme")).toThrow("Invalid theme name");
    expect(() => validateThemeName("DARK")).toThrow("Invalid theme name");
  });

  it("rejects names starting with a digit", () => {
    expect(() => validateThemeName("1theme")).toThrow("Invalid theme name");
  });

  it("rejects names with spaces or underscores", () => {
    expect(() => validateThemeName("my theme")).toThrow("Invalid theme name");
    expect(() => validateThemeName("my_theme")).toThrow("Invalid theme name");
  });
});

describe("toUnderscored", () => {
  it("converts hyphens to underscores", () => {
    expect(toUnderscored("ocean-dark")).toBe("ocean_dark");
    expect(toUnderscored("my-brand-theme")).toBe("my_brand_theme");
    expect(toUnderscored("simple")).toBe("simple");
  });
});
