# @presentation-skill-pack/install

## 0.1.2

### Patch Changes

- Copilot adapter now uses sentinel sections (`<!-- BEGIN presentation-skill-pack -->`) so multiple skill packs can coexist in the same `.github/copilot-instructions.md` without overwriting each other.

## 0.1.1

### Patch Changes

- Add GitHub Copilot adapter: `npx @presentation-skill-pack/install copilot` writes `.github/copilot-instructions.md` in the current project and optionally registers the MCP server in `.vscode/mcp.json`.

## 0.2.0

### Minor Changes

- d8d2fb0: Initial release of presentation-skill-pack v0.1.0.

  Turn rough notes into a polished, self-contained HTML slide deck for any AI agent.
  Includes dual-language renderers (Node + Python), MCP server, 5 themes, 5 adapters,
  installer CLI, and interactive theme scaffolder.

### Patch Changes

- Updated dependencies [d8d2fb0]
  - @presentation-skill-pack/core@0.2.0
