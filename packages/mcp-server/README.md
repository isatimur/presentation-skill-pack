# @presentation-skill-pack/mcp-server

MCP server that exposes presentation-skill-pack tools to any MCP-compatible AI agent (Claude Code, Cursor, etc.).

## Install

```bash
npx @presentation-skill-pack/mcp-server
```

## Add to Claude Code

Add to your project's `.claude/mcp.json` (or `~/.claude/mcp.json` for global):

```json
{
  "mcpServers": {
    "presentation-skill-pack": {
      "command": "npx",
      "args": ["-y", "@presentation-skill-pack/mcp-server"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `render_deck` | Render a deck JSON spec to a self-contained HTML slide deck; optionally write to a file. |
| `list_themes` | List all installed themes with name, version, vibe, and description. |
| `apply_theme` | Swap the theme in `meta.theme` while keeping all slide content unchanged. |
| `audit_deck` | Validate deck JSON against the schema and return structured issues with severity. |
| `generate_deck_prompt` | Build a system prompt with the active theme's palette and deck schema reference for an agent. |
