# Marketing Plan — presentation-skill-pack

*Last updated: 2026-06-29. Foundation: `.agents/product-marketing-context.md`.*

## Goal

Make presentation-skill-pack the **top / #1 presentation skill** — measured across four fronts the
owner wants all of: **discoverability** (skill/MCP directories + AI search), **adoption**
(npm/PyPI installs + GitHub stars), **web traffic/SEO** (the Vercel site), and a **launch moment**.

## The core insight driving everything

Two big capabilities just shipped — **export to PowerPoint/Keynote/Google Slides** and a **browser
editor studio** — and they appear in **zero** marketing surfaces (README, landing hero, meta/OG,
gallery, comparison pages all predate them). They are simultaneously:
- the strongest **differentiator** (removes competitors' platform lock-in),
- a set of new **high-intent keywords** ("AI to PowerPoint", "deck to pptx", "edit AI slides"),
- and the **launch hook** ("now exports to PowerPoint + a visual studio").

So the plan is anchored on propagating that story everywhere, then amplifying it.

## Skill → goal map (which marketing skills apply)

| Goal | Primary skills | Output |
|------|----------------|--------|
| Discoverability | `directory-submissions`, `ai-seo`, `schema-markup` | listed in MCP/skill/AI-tool directories; cited by AI search; rich results |
| Adoption | `copywriting`, `launch-strategy`, `marketing-psychology` | stronger README/site funnel; launch; social proof loop |
| Web traffic/SEO | `seo-audit`, `programmatic-seo`, `competitor-alternatives`, `content-strategy` | fixed on-page SEO; pSEO + alternative pages for new keywords |
| Launch moment | `launch-strategy`, `ad-creative`/`social-content`, `directory-submissions` | PH/HN/Reddit + directory blitz, all on the export/studio story |

## Prioritized roadmap (ICE — do top-down)

### P0 — Positioning refresh (linchpin; unblocks everything) · skill: copywriting
Lead every surface with the new story: **"Generate decks in your AI agent → export to
PowerPoint/Keynote/Google Slides → edit in the studio."**
- README hero + first section + features table + new "Export" / "Studio" coverage (partly done in
  the feature PR; tighten the top-of-README pitch).
- Landing page hero (`web/index.html`): headline, subhead, CTAs (Install / Open Studio / Gallery),
  and a new "Export anywhere" + "Studio" section.
- `<title>` + meta description + OG/Twitter tags → include "PowerPoint / Keynote / Google Slides" and
  "AI presentation/slide generator for developers".

### P1 — SEO capture of the newly-unlocked keywords · skills: seo-audit, ai-seo, schema-markup
- seo-audit pass on the site (titles, H1s, internal links, canonical, sitemap incl. /studio).
- Add `SoftwareApplication`/`WebApplication` schema for the tool + `FAQPage` schema (answers the
  objections: "is it locked to Claude?", "can it export to PowerPoint?").
- ai-seo: structure pages as answers so ChatGPT/Perplexity/Claude cite us for "AI tool to make a
  PowerPoint", "convert notes to slides with an AI agent", "MCP presentation server".

### P2 — Programmatic + comparison pages · skills: programmatic-seo, competitor-alternatives
- Alternative/vs pages targeting decision keywords: "Gamma alternative for developers", "Tome
  alternative", "Slidev vs presentation-skill-pack", "AI PowerPoint generator". (The site already has
  `web/for/` and `web/vs/` — extend with export-led angles.)
- pSEO templates: "[agent] presentation skill" and "AI deck to [PowerPoint|Keynote|Google Slides]".

### P3 — Discoverability placements · skill: directory-submissions
- MCP registries / awesome-mcp lists, Claude-skill / agent-skill directories, AI-tool aggregators
  (TAAFT, Futurepedia), dev directories, AlternativeTo, Product Hunt "upcoming". Track in a sheet.

### P4 — Launch moment · skills: launch-strategy, social-content/ad-creative
- One coordinated launch on the export+studio story: Product Hunt + Hacker News (Show HN) + relevant
  subreddits/Discords + X/LinkedIn. Assets: hero GIF (agent→pptx→studio), 25-deck gallery, one-liner,
  FAQ. Sequence the directory blitz (P3) to land with the launch for compounding signal.

## Execute-now (top items, this pass)
1. **P0 positioning refresh** — README top + landing hero + meta/OG. *(starting now)*
2. **P1 schema + meta** — FAQ/SoftwareApplication schema + sitemap `/studio`.
Then checkpoint before the outward-facing P3/P4 (directory submissions + launch posting are
publish-once actions that should be owner-approved).

## Open inputs (from the owner — flagged in the context doc)
- Monetization (free-only vs paid themes/hosted) → tilts messaging adoption-vs-revenue.
- Current metrics (downloads/stars) → baseline for the launch + proof points.
- Named direct competitors (closest agent-native deck tools) → sharpens the vs/alternative pages.
