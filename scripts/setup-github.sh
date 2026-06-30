#!/usr/bin/env bash
set -euo pipefail

# One-time GitHub repo metadata setup for star-conversion.
# Run manually once. Requires: gh auth login (with repo scope).
#
# What this fills in (currently blank on the repo):
#   - Description  -> shows under the repo title + in search results
#   - Homepage     -> the live gallery, clickable from the repo header
#   - Topics       -> drive discovery via GitHub topic pages & search

gh repo edit isatimur/presentation-skill-pack \
  --description "Turn rough notes into a polished, schema-validated slide deck in any AI agent (Claude Code, Cursor, Codex, Gemini CLI, Copilot) — then export native, editable PowerPoint, Keynote & Google Slides. Skill + MCP server." \
  --homepage "https://presentation-skill-pack.vercel.app" \
  --add-topic presentation \
  --add-topic slides \
  --add-topic ai-agent \
  --add-topic mcp \
  --add-topic model-context-protocol \
  --add-topic claude-code \
  --add-topic pptx \
  --add-topic keynote \
  --add-topic deck-generator \
  --add-topic cursor

# ---------------------------------------------------------------------------
# Social Preview image (NOT settable via gh CLI as of this writing).
# Set it manually once: GitHub repo -> Settings -> General -> "Social preview"
# -> upload a 1280x640 PNG/JPG (<1MB). This is the card that renders when the
# repo is shared on X/LinkedIn/Slack and is a major star-conversion lever.
# Suggested: a single hero slide from the gallery + the tagline + npm install line.
# ---------------------------------------------------------------------------
