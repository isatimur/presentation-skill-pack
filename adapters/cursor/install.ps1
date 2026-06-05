# install.ps1 — Cursor adapter for presentation-skill-pack (Windows)
# Usage:  $env:PSP_CORE_DIR="<path>"; .\install.ps1 [full|lite]
param(
    [string]$Mode = "full"
)

$ErrorActionPreference = "Stop"

if (-not $env:PSP_CORE_DIR) {
    Write-Error "PSP_CORE_DIR must be set to the @presentation-skill-pack/core directory"
    exit 1
}

$PspCoreDir = $env:PSP_CORE_DIR
$TargetDir  = Join-Path $HOME ".cursor\rules"
$TargetFile = Join-Path $TargetDir "presentation-generator.mdc"

Write-Host "presentation-skill-pack > cursor adapter"
Write-Host "  mode:   $Mode"
Write-Host "  target: $TargetFile"
Write-Host ""

New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

# ── read SKILL.md and strip YAML front-matter ─────────────────────────────────
$SkillLines  = Get-Content (Join-Path $PspCoreDir "SKILL.md")
$InFront     = $false
$Seen        = $false
$BodyLines   = [System.Collections.Generic.List[string]]::new()

foreach ($line in $SkillLines) {
    if ($line -eq "---" -and -not $Seen) { $InFront = $true; $Seen = $true; continue }
    if ($line -eq "---" -and $InFront)   { $InFront = $false; continue }
    if (-not $InFront) { $BodyLines.Add($line) }
}

$SkillBody = $BodyLines -join "`n"

# ── write .mdc rules file ─────────────────────────────────────────────────────
$Mdc = @"
---
description: Generate a complete polished HTML slide deck from rough notes or structured content.
globs: []
alwaysApply: false
---

$SkillBody
"@

Set-Content -Path $TargetFile -Value $Mdc -Encoding UTF8
Write-Host "  OK  presentation-generator.mdc written"

# ── full mode: register MCP server ───────────────────────────────────────────
if ($Mode -eq "full") {
    $McpConfig = Join-Path $HOME ".cursor\mcp.json"

    if (Test-Path $McpConfig) {
        $cfg = Get-Content $McpConfig -Raw | ConvertFrom-Json
        if (-not $cfg.mcpServers) {
            $cfg | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue ([PSCustomObject]@{})
        }
        $entry = [PSCustomObject]@{
            command = "npx"
            args    = @("@presentation-skill-pack/mcp-server")
        }
        $cfg.mcpServers | Add-Member -NotePropertyName "presentation-skill-pack" `
                                      -NotePropertyValue $entry -Force
        $cfg | ConvertTo-Json -Depth 10 | Set-Content $McpConfig -Encoding UTF8
    } else {
        New-Item -ItemType Directory -Force -Path (Split-Path $McpConfig) | Out-Null
        @{
            mcpServers = @{
                "presentation-skill-pack" = @{
                    command = "npx"
                    args    = @("@presentation-skill-pack/mcp-server")
                }
            }
        } | ConvertTo-Json -Depth 10 | Set-Content $McpConfig -Encoding UTF8
    }
    Write-Host "  OK  MCP server registered in ~/.cursor/mcp.json"
}

Write-Host ""
Write-Host "Done. Restart Cursor to pick up the changes."
if ($Mode -eq "lite") {
    Write-Host "  (lite mode — MCP server not registered)"
}
