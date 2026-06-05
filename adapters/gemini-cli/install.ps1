# install.ps1 — Gemini CLI adapter for presentation-skill-pack (Windows)
# Usage:  $env:PSP_CORE_DIR="<path>"; .\install.ps1 [full|lite]
param(
    [string]$Mode = "full"
)

$ErrorActionPreference = "Stop"

if (-not $env:PSP_CORE_DIR) {
    Write-Error "PSP_CORE_DIR must be set to the @presentation-skill-pack/core directory"
    exit 1
}

$PspCoreDir      = $env:PSP_CORE_DIR
$Target          = Join-Path $HOME ".gemini\extensions\presentation-generator"
$GeminiSettings  = Join-Path $HOME ".gemini\settings.json"

Write-Host "presentation-skill-pack > gemini-cli adapter"
Write-Host "  mode:   $Mode"
Write-Host "  target: $Target"
Write-Host ""

# ── copy skill file ───────────────────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $Target | Out-Null

Copy-Item -Path (Join-Path $PspCoreDir "SKILL.md") `
          -Destination (Join-Path $Target "SKILL.md") -Force
Write-Host "  OK  SKILL.md copied"

# ── write extension.json ──────────────────────────────────────────────────────
$ExtJson = [ordered]@{
    name        = "presentation-generator"
    version     = "0.1.0"
    description = "Generate polished HTML slide decks from notes."
    skills      = @(@{ path = "./SKILL.md" })
}
$ExtJson | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $Target "extension.json") -Encoding UTF8
Write-Host "  OK  extension.json written"

# ── full mode: register MCP server ───────────────────────────────────────────
if ($Mode -eq "full") {
    if (Test-Path $GeminiSettings) {
        $cfg = Get-Content $GeminiSettings -Raw | ConvertFrom-Json
        if (-not $cfg.mcpServers) {
            $cfg | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue ([PSCustomObject]@{})
        }
        $entry = [PSCustomObject]@{
            command = "npx"
            args    = @("@presentation-skill-pack/mcp-server")
        }
        $cfg.mcpServers | Add-Member -NotePropertyName "presentation-skill-pack" `
                                      -NotePropertyValue $entry -Force
        $cfg | ConvertTo-Json -Depth 10 | Set-Content $GeminiSettings -Encoding UTF8
    } else {
        New-Item -ItemType Directory -Force -Path (Split-Path $GeminiSettings) | Out-Null
        @{
            mcpServers = @{
                "presentation-skill-pack" = @{
                    command = "npx"
                    args    = @("@presentation-skill-pack/mcp-server")
                }
            }
        } | ConvertTo-Json -Depth 10 | Set-Content $GeminiSettings -Encoding UTF8
    }
    Write-Host "  OK  MCP server registered in ~/.gemini/settings.json"
}

Write-Host ""
Write-Host "Done. Restart Gemini CLI to pick up the changes."
if ($Mode -eq "lite") {
    Write-Host "  (lite mode — MCP server not registered)"
}
