# Contributing to presentation-skill-pack

## Setup

```bash
git clone https://github.com/isatimur/presentation-skill-pack.git
cd presentation-skill-pack
pnpm install
```

Requires Node.js 20+ and pnpm 8. If you don't have pnpm: `npm i -g pnpm@8`.

## Build

```bash
pnpm build        # build all packages
pnpm typecheck    # TypeScript type-check across the whole monorepo
pnpm lint         # ESLint across all packages
pnpm test         # run all test suites (vitest)
```

To work on a single package, `cd` into it and run the same commands — each package has its own `build`, `test`, `lint`, and `typecheck` scripts.

## Adding a theme

Use the scaffold CLI:

```bash
pnpm --filter @presentation-skill-pack/create-theme exec create-presentation-theme my-theme-name
```

This generates `packages/themes/my-theme-name/` with a starter `theme.json` and `package.json`. Edit `theme.json` to set your palette, typography, and layout overrides, then validate it:

```bash
pnpm --filter @presentation-skill-pack/core exec validate-theme packages/themes/my-theme-name/theme.json
```

Themes must pass schema validation before they can be published.

## Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

When your PR includes a user-facing change:

```bash
pnpm changeset
```

Select the affected packages, choose the bump level (`patch` / `minor` / `major`), and write a one-line summary. Commit the generated `.changeset/*.md` file alongside your code changes.

PRs that touch only internal tooling, tests, or docs do not need a changeset.

## Syncing versions

After a changeset is consumed and all packages are bumped, you can keep every package in lockstep with core:

```bash
pnpm sync-versions
```

This reads the version from `packages/core/package.json` and writes it to every other `package.json` in the monorepo.

## PR conventions

- Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- All tests and typechecks must pass locally before opening a PR
- Include a changeset if the change affects published packages

## Repository structure

```
packages/core/          schema, theme loader, validator
packages/renderer-node/ Node.js HTML renderer + CLI
packages/mcp-server/    MCP server (5 tools)
packages/install/       one-command installer CLI
packages/create-theme/  theme scaffold CLI
packages/renderer-python/ Python renderer (PyPI)
packages/themes/*/      publishable theme packages
adapters/               per-agent install scripts
web/                    landing page (Vercel)
tools/                  monorepo scripts (sync-versions)
```
