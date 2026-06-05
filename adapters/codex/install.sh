#!/usr/bin/env bash
# install.sh — Codex adapter for presentation-skill-pack
# Usage:  PSP_CORE_DIR=<path> bash install.sh [full|lite]
set -euo pipefail

MODE="${1:-full}"
: "${PSP_CORE_DIR:?PSP_CORE_DIR must be set to the @presentation-skill-pack/core directory}"

TARGET="$HOME/.codex/skills/presentation-generator"
CODEX_CONFIG="$HOME/.codex/config.json"

echo "presentation-skill-pack › codex adapter"
echo "  mode:   $MODE"
echo "  target: $TARGET"
echo ""

# ── copy skill files ──────────────────────────────────────────────────────────
mkdir -p "$TARGET/references"

cp "$PSP_CORE_DIR/SKILL.md" "$TARGET/SKILL.md"
echo "  ✓  SKILL.md copied"

if [ -d "$PSP_CORE_DIR/references" ]; then
  cp -r "$PSP_CORE_DIR/references/." "$TARGET/references/"
  echo "  ✓  references/ copied"
fi

# ── full mode: register MCP server ───────────────────────────────────────────
if [ "$MODE" = "full" ]; then
  if [ -f "$CODEX_CONFIG" ]; then
    EXISTING=$(cat "$CODEX_CONFIG")
    UPDATED=$(node -e "
      const cfg = JSON.parse(process.argv[1]);
      cfg.mcpServers = cfg.mcpServers || {};
      cfg.mcpServers['presentation-skill-pack'] = {
        command: 'npx',
        args: ['@presentation-skill-pack/mcp-server']
      };
      process.stdout.write(JSON.stringify(cfg, null, 2));
    " "$EXISTING")
    printf '%s\n' "$UPDATED" > "$CODEX_CONFIG"
  else
    mkdir -p "$(dirname "$CODEX_CONFIG")"
    cat > "$CODEX_CONFIG" <<'JSON'
{
  "mcpServers": {
    "presentation-skill-pack": {
      "command": "npx",
      "args": ["@presentation-skill-pack/mcp-server"]
    }
  }
}
JSON
  fi
  echo "  ✓  MCP server registered in ~/.codex/config.json"
fi

echo ""
echo "Done. Restart Codex to pick up the changes."
if [ "$MODE" = "lite" ]; then
  echo "  (lite mode — MCP server not registered)"
fi
