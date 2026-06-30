# Product Marketing Context

*Last updated: 2026-06-29*

> **V1 auto-drafted from the repo (README, website, package metadata).** Sections marked _[needs your input]_ are guesses or gaps — correct them. Customer-language and proof-point sections are placeholders until there's real usage data.

## Product Overview
**One-liner:** Turn rough notes into a polished slide deck — for any AI agent.
**What it does:** A universal skill layer that gives AI coding agents (Claude Code, Cursor, Codex, Gemini CLI, Copilot) a structured, schema-validated way to author slide decks. The agent writes a Deck JSON spec; a renderer turns it into a single self-contained HTML file — no build tool, no slide host. The same deck **exports to native, editable PowerPoint (`.pptx`)** — which opens in Keynote and imports into Google Slides — and can be edited in a **browser studio** (live preview + export). Themes are swappable, publishable npm packages, and an MCP server exposes the whole workflow as typed tools.
**Product category:** AI agent skill / MCP server for presentation generation (the "shelf": developer tools + MCP servers + AI presentation tools).
**Product type:** Open-source developer tooling (npm + PyPI packages, MCP server, CLI). Not a hosted SaaS.
**Business model:** Free, MIT-licensed, open source. No paid tier today. _[needs your input: is monetization planned — paid themes, hosted service, enterprise support? This decides whether marketing optimizes for adoption or revenue.]_

## Target Audience
**Target companies:** Not company-gated — individual developers and teams already using an AI coding agent. Skews indie devs, startup engineers, and technical founders. _[confirm]_
**Decision-makers:** The developer themselves (self-serve install, no procurement). For team rollout, a tech lead / DevEx owner.
**Primary use case:** "I need to make a deck (pitch, update, demo, README-to-slides) and I'd rather have my AI agent generate it than fight Keynote/Google Slides."
**Jobs to be done:**
- Turn unstructured notes / a transcript / a spec / a README into a presentable deck without opening a design tool.
- Produce an on-brand deck programmatically inside an agent workflow or pipeline.
- Ship a single shareable HTML file (no hosting, no export dance).
- Take the generated deck into the tool they actually present from — PowerPoint, Keynote, or Google Slides — as a native, editable file.
- Hand-tweak a generated deck in a visual editor without leaving the browser.
**Use cases:**
- Startup pitch deck, investor update, sales proposal, product demo, internal review, conference talk.
- Agent/pipeline-driven deck generation (CI, batch, MCP tool call).
- Theme authors publishing/installing community themes via npm.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| User (developer using an AI agent) | Speed, looks decent by default, no design work | Decks are tedious; design tools break flow | "Notes in, polished deck out — inside the agent you already use" |
| Champion (tech lead / DevEx) | Consistency, on-brand output, reproducibility | Team decks look inconsistent and ad hoc | Versioned themes + schema-validated specs = consistent decks |
| Theme author / OSS contributor | Extensibility, clean schema, distribution | Most slide tools are closed or hard to theme | Themes are publishable npm packages with a scaffold CLI |

## Problems & Pain Points
**Core problem:** Making a good-looking slide deck is slow and pulls you out of your working context, and AI agents have no structured, repeatable way to produce one.
**Why alternatives fall short:**
- End-user apps (Gamma, Tome, Beautiful.ai): not agent-native, not in your terminal/editor, output locked to their platform.
- Dev frameworks (reveal.js, Slidev, Marp): you still hand-author everything; no agent integration, no schema for an LLM to target.
- Asking an LLM for "slides" raw: unstructured HTML, inconsistent, no theming, not validated.
**What it costs them:** Hours per deck; context-switching; inconsistent, off-brand results.
**Emotional tension:** "I'm a builder, not a designer — why does a 10-slide update take an afternoon?"

## Competitive Landscape
**Direct:** Other MCP/agent presentation tools — _[needs your input: name the closest agent-native ones you're aware of]_. Falls short: most are not schema-validated, multi-agent, or theme-extensible.
**Secondary:** Slidev / Marp / reveal.js — falls short because they're manual, not agent-driven, and have no LLM-targetable spec.
**Indirect:** Gamma / Tome / Beautiful.ai / Google Slides / Keynote — falls short because they're outside the developer workflow and produce platform-locked output, not a portable HTML file.

## Differentiation
**Key differentiators:**
- **Agent-native + universal** — one install works across Claude Code, Cursor, Codex, Gemini CLI, and Copilot (not locked to one agent).
- **Schema-validated Deck JSON** — the LLM targets a typed spec, so output is consistent and machine-checkable.
- **Self-contained HTML output** — one file, no build, no hosting, opens anywhere; also a shareable artifact (see growth loop).
- **Exports to PowerPoint / Keynote / Google Slides** — one structured-deck → native, *editable* `.pptx` (not an image dump). The competitors' big lock-in (platform-trapped output) is exactly what this removes.
- **Browser editor studio** — open a created deck, edit via schema-driven forms with live preview, re-export. Created decks embed their own source, so any `.pptx`/HTML round-trips back into the editor.
- **Themes as publishable npm packages** — swappable, versioned, community-extensible, with a scaffold CLI.
- **MCP server with typed tools** — drops into any MCP-compatible agent.
**How we do it differently:** Separate the *spec* (Deck JSON the agent writes) from the *render* (theme + renderer), so authoring is agent-friendly and styling is reusable.
**Why that's better:** Consistent, on-brand, reproducible decks generated where you already work.
**Why customers choose us:** Free, open, one-command install, and it meets the developer inside their existing agent.

## Objections
| Objection | Response |
|-----------|----------|
| "Why not just use Gamma/Tome?" | Those live outside your workflow and lock your output to their platform. This runs in the agent you already use and emits a portable HTML file you own. |
| "Can an LLM really make a deck that looks good?" | The agent fills a schema, not freeform HTML; themes do the design. See the 5 gallery decks for the actual output quality. |
| "Is this locked to Claude?" | No — one install supports Claude Code, Cursor, Codex, Gemini CLI, and Copilot. |
| "Another dependency to maintain?" | MIT, self-contained output, no runtime service to keep alive. |
**Anti-persona:** Non-technical users who won't touch a CLI/agent; people who need real-time collaborative editing or a hosted presentation platform.

## Switching Dynamics
**Push:** Decks are slow; design tools break flow; LLM-generated slides are messy and inconsistent.
**Pull:** Generate a polished deck from notes without leaving the agent; portable HTML; on-brand themes.
**Habit:** Defaulting to Google Slides/Keynote/Gamma; copy-pasting from a chat LLM.
**Anxiety:** "Will the output actually look professional?" "Is setup painful?" (Answer both with the gallery + one-command install.)

## Customer Language
_[Placeholder — replace with verbatim quotes from issues, Discord, Reddit, PH comments as they come in.]_
**How they describe the problem:**
- "_[verbatim TBD]_"
**How they describe us:**
- "_[verbatim TBD]_"
**Words to use:** notes → deck, self-contained HTML, on-brand, one install, any agent, schema-validated, zero design skills.
**Words to avoid:** "AI slop," over-promising "beautiful" without showing it, enterprise jargon (audience is developers).
**Glossary:**
| Term | Meaning |
|------|---------|
| Deck JSON | The schema-validated spec the agent authors |
| Theme | A swappable, publishable npm package defining colors/type/geometry |
| Renderer | Turns Deck JSON + theme into a self-contained HTML file (Node or Python) |
| Adapter | Per-agent installer (claude-code, cursor, codex, gemini-cli, cli) |
| MCP server | Exposes the workflow as typed tools to any MCP-compatible agent |

## Brand Voice
**Tone:** Confident, editorial, developer-to-developer. Shows rather than tells.
**Style:** Direct, concrete, lightly technical; mono-accented, lowercase product name; no hype words.
**Personality:** Crafted, pragmatic, opinionated about taste, unpretentious, fast.

## Proof Points
_[Placeholder — fill as traction appears.]_
**Metrics:** npm/PyPI downloads, GitHub stars, decks rendered — _[TBD]_.
**Customers:** _[TBD]_.
**Testimonials:** _[TBD]_.
**Value themes:**
| Theme | Proof |
|-------|-------|
| Output actually looks good | 25 distinct gallery decks at presentation-skill-pack.vercel.app |
| Truly universal | Adapters for Claude Code, Cursor, Codex, Gemini CLI, Copilot |
| Not platform-locked | Exports to native editable PowerPoint / Keynote / Google Slides |
| Editable, not just generated | Browser studio at /studio — open, edit, re-export any created deck |
| Zero friction | Single `npx` install command |

## Goals
**Business goal:** Adoption — grow installs, GitHub stars, and decks rendered for the free OSS tool. _[confirm vs. a revenue goal]_
**Conversion action:** Run `npx @presentation-skill-pack/install <agent>` (and star the repo).
**Current metrics:** _[TBD — drop in current downloads/stars so future skills can calibrate.]_
