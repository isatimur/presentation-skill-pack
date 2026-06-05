import { describe, it, expect } from "vitest";
import { validateDeckJson, validateThemeJson } from "../src/index.js";

describe("validateDeckJson", () => {
  it("accepts a minimal valid deck", () => {
    const result = validateDeckJson(JSON.stringify({
      type: "deck",
      slides: [{ layout: "title", heading: "Hello" }]
    }));
    expect(result.valid).toBe(true);
  });

  it("rejects missing type", () => {
    const result = validateDeckJson(JSON.stringify({ slides: [{ layout: "title" }] }));
    expect(result.valid).toBe(false);
  });

  it("rejects invalid JSON", () => {
    const result = validateDeckJson("not-json");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid JSON/);
  });
});

describe("validateThemeJson", () => {
  it("accepts a valid theme manifest", () => {
    const result = validateThemeJson(JSON.stringify({ name: "my-theme", version: "1.0.0" }));
    expect(result.valid).toBe(true);
  });

  it("rejects a theme with invalid name", () => {
    const result = validateThemeJson(JSON.stringify({ name: "My Theme", version: "1.0.0" }));
    expect(result.valid).toBe(false);
  });
});
