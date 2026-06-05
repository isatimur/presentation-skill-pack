import { describe, it, expect } from "vitest";
import { resolveAdapterScript, VALID_ADAPTERS } from "../src/index.js";
import type { FsOps } from "../src/index.js";

/** Build a fake FsOps where only the given path suffix is considered to exist. */
function fakeFs(existsIfEndsWith: string): FsOps {
  return {
    existsSync: (p: string) => p.endsWith(existsIfEndsWith),
    realpathSync: (p: string) => p,
  };
}

/** FsOps where nothing exists on disk. */
const noneExists: FsOps = {
  existsSync: () => false,
  realpathSync: (p: string) => p,
};

describe("resolveAdapterScript", () => {
  it("returns a path ending in install.sh for claude-code on linux", () => {
    const result = resolveAdapterScript("claude-code", "linux", fakeFs("install.sh"));
    expect(result).toMatch(/install\.sh$/);
  });

  it("returns a path ending in install.sh for claude-code on darwin", () => {
    const result = resolveAdapterScript("claude-code", "darwin", fakeFs("install.sh"));
    expect(result).toMatch(/install\.sh$/);
  });

  it("returns a path ending in install.ps1 for cursor on win32", () => {
    const result = resolveAdapterScript("cursor", "win32", fakeFs("install.ps1"));
    expect(result).toMatch(/install\.ps1$/);
  });

  it("the resolved path contains the adapter name", () => {
    const result = resolveAdapterScript("codex", "linux", fakeFs("install.sh"));
    expect(result).toContain("codex");
  });

  it("throws with 'Unknown adapter' for an unrecognised adapter name", () => {
    expect(() => resolveAdapterScript("unknown", "linux", fakeFs("install.sh"))).toThrow(
      "Unknown adapter"
    );
  });

  it("throws 'Adapter script not found' when no candidate exists on disk", () => {
    expect(() => resolveAdapterScript("claude-code", "linux", noneExists)).toThrow(
      "Adapter script not found"
    );
  });

  it("returns the realpathSync result (follows symlinks)", () => {
    const fs: FsOps = {
      existsSync: () => true,
      realpathSync: (_p: string) => "/resolved/real/path/install.sh",
    };
    const result = resolveAdapterScript("claude-code", "linux", fs);
    expect(result).toBe("/resolved/real/path/install.sh");
  });

  it("VALID_ADAPTERS contains all expected entries", () => {
    expect(VALID_ADAPTERS).toContain("claude-code");
    expect(VALID_ADAPTERS).toContain("cursor");
    expect(VALID_ADAPTERS).toContain("copilot");
    expect(VALID_ADAPTERS).toContain("codex");
    expect(VALID_ADAPTERS).toContain("gemini-cli");
    expect(VALID_ADAPTERS).toContain("cli");
  });
});
