#!/usr/bin/env bash
# install.sh — Gemini CLI adapter for presentation-skill-pack
# Usage:  PSP_CORE_DIR=<path> bash install.sh [full|lite]
set -euo pipefail

MODE="${1:-full}"
: "${PSP_CORE_DIR:?PSP_CORE_DIR must be set to the @presentation-skill-pack/core directory}"

TARGET="$HOME/.gemini/extensions/presentation-generator"
GEMINI_SETTINGS="$HOME/.gemini/settings.json"

echo "presentation-skill-pack › gemini-cli adapter"
echo "  mode:   $MODE"
echo "  target: $TARGET"
echo ""

# ── copy skill file ───────────────────────────────────────────────────────────
mkdir -p "$TARGET"

cp "$PSP_CORE_DIR/SKILL.md" "$TARGET/SKILL.md"
echo "  ✓  SKILL.md copied"

# ── write extension.json ──────────────────────────────────────────────────────
cat > "$TARGET/extension.json" <<'JSON'
{
  "name": "presentation-generator",
  "version": "0.1.0",
  "description": "Generate polished HTML slide decks from notes.",
  "skills": [
    { "path": "./SKILL.md" }
  ]
}
JSON
echo "  ✓  extension.json written"

# ── full mode: register MCP server in settings.json ──────────────────────────
if [ "$MODE" = "full" ]; then
  if [ -f "$GEMINI_SETTINGS" ]; then
    EXISTING=$(cat "$GEMINI_SETTINGS")
    UPDATED=$(node -e "
      const cfg = JSON.parse(process.argv[1]);
      cfg.mcpServers = cfg.mcpServers || {};
      cfg.mcpServers['presentation-skill-pack'] = {
        command: 'npx',
        args: ['@presentation-skill-pack/mcp-server']
      };
      process.stdout.write(JSON.stringify(cfg, null, 2));
    " "$EXISTING")
    printf '%s\n' "$UPDATED" > "$GEMINI_SETTINGS"
  else
    mkdir -p "$(dirname "$GEMINI_SETTINGS")"
    cat > "$GEMINI_SETTINGS" <<'JSON'
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
  echo "  ✓  MCP server registered in ~/.gemini/settings.json"
fi

echo ""
echo "Done. Restart Gemini CLI to pick up the changes."
if [ "$MODE" = "lite" ]; then
  echo "  (lite mode — MCP server not registered)"
fi
