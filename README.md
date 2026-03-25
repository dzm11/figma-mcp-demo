# figma-mcp-demo

This repository contains a frontend design system built with React + TypeScript + Storybook, plus a pipeline for syncing tokens from Figma Variables.

Main goals of the project:

- keep UI components aligned with Figma,
- maintain a single source of truth for design values,
- enable fast review of changes through Storybook,
- automate token pull/build and publishing to GitHub.

## Stack

- React 19
- TypeScript 5
- Vite 7
- Storybook 10
- Figma Code Connect

## How this project works

In short:

1. Design values are defined in Figma Variables.
2. The pipeline fetches this data through the Figma REST API.
3. The generator produces final token files used by components.
4. Components (CSS Modules) should use `var(--token)` instead of hardcoded values.

## Most important files: src/styles/tokens.css and src/styles/typography.css

The files [src/styles/tokens.css](src/styles/tokens.css) and [src/styles/typography.css](src/styles/typography.css) are generated, app-facing outputs.

That means:

- components and global styles read tokens and typography utilities from these files,
- Storybook imports the same files, so previews reflect the real design system state,
- these files should not be edited manually, because they are generated.

`src/styles/typography.css` contains utility classes generated from Figma TEXT styles,
for example `.body-md-14-regular` and `.heading-xl`.

Related places:

- [src/index.css](src/index.css) imports generated styles globally,
- [.storybook/preview.ts](.storybook/preview.ts) imports generated styles for stories,
- [tokens/tokens.source.json](tokens/tokens.source.json) is the normalized source fetched from Figma.

## Folder architecture

- [src/components](src/components) - UI components (TSX + CSS Modules + types)
- [src/styles](src/styles) - global styles, tokens, and fonts
- [src/stories](src/stories) - Storybook stories
- [src/assets](src/assets) - SVG/PNG assets
- [scripts](scripts) - token pipeline (pull/build/sync/pr)
- [config/tokens.config.json](config/tokens.config.json) - token generator configuration
- [tokens/tokens.source.json](tokens/tokens.source.json) - normalized source data fetched from Figma

## Commands

This project exposes two kinds of runnable automation:

- `npm run ...` commands defined in `package.json`
- direct `node scripts/...` utilities used by those commands or for one-off maintenance

### Development and local preview

- `npm run dev` - start the Vite app locally for development
- `npm run build` - run the TypeScript build and produce the production bundle
- `npm run lint` - run ESLint across the repo
- `npm run preview` - serve the built production app locally
- `npm run storybook` - start Storybook locally on port `6006`
- `npm run build-storybook` - build the static Storybook output for CI or hosting

### Figma Code Connect

- `npm run figma:publish` - publish all Code Connect mappings from `src/figma` to Figma Dev Mode
- `npm run figma:publish:dry` - run a dry validation of the Code Connect publish without uploading

### Variables and token pipeline

- `npm run tokens:pull` - fetch local Figma Variables, text styles, and effect styles into `tokens/tokens.source.json`
- `npm run tokens:build` - generate `src/styles/tokens.css` and `src/styles/typography.css` from the existing source JSON
- `npm run tokens:sync` - run the full token pipeline: pull from Figma, then rebuild generated CSS files
- `npm run tokens:pr` - run token sync, create a branch, commit changed token files, push, and open a GitHub PR

### Icons pipeline

- `npm run icons:sync` - fetch icons from the Figma Icons page, export SVGs, convert them to React TSX components, rebuild the icon barrel, and regenerate `src/figma/Icons.figma.tsx`
- `npm run icons:pr` - run the full icon sync, then create a branch, commit generated icon files, push, and open a GitHub PR

### Script reference

These are the direct script entrypoints behind the npm commands.

#### Token and variable scripts

- `node scripts/pull-from-figma.mjs` - raw Figma REST API pull for variables, effect styles, and text styles
- `node scripts/build-tokens.mjs` - rebuild generated CSS token files from the checked-in source JSON without calling Figma
- `node scripts/sync-tokens.mjs` - convenience wrapper that runs pull and build in sequence
- `node scripts/create-pr.mjs` - full token automation: sync, branch, commit, push, and PR creation

#### Icon scripts

- `node scripts/sync-icons.mjs` - fetch icons from Figma, normalize colors to `currentColor`, write raw SVGs, generate React TSX icons, rebuild the barrel file, and regenerate icon Code Connect mappings
- `node scripts/create-icons-pr.mjs` - full icon automation: sync, branch, commit, push, and PR creation

#### Utility and maintenance scripts

- `node scripts/patch-system-color-scopes.mjs` - one-off maintenance script that updates `System/` color variables in the `Primitives` collection in Figma to hide them from publishing and expose all supported scopes
- `node scripts/_tmp_test_variable_filters.mjs` - temporary diagnostic script for testing Figma Variables API filtering behavior; not part of the normal workflow

### Typical workflows

#### Update design tokens from Figma

1. Run `npm run tokens:sync`
2. Review changes in `tokens/tokens.source.json`, `src/styles/tokens.css`, and `src/styles/typography.css`
3. Start Storybook with `npm run storybook` for a visual sanity check
4. Commit manually or run `npm run tokens:pr`

#### Update icons from Figma

1. Run `npm run icons:sync`
2. Review generated changes in `src/assets/icons/raw`, `src/assets/icons/SVGR`, and `src/figma/Icons.figma.tsx`
3. Publish the generated mappings with `npm run figma:publish` if needed for Figma Dev Mode
4. Commit manually or run `npm run icons:pr`

#### Publish Code Connect mappings

1. Run `npm run figma:publish:dry` to validate locally
2. Run `npm run figma:publish` to upload mappings to Figma

### Requirements

- Figma-related commands require `.env.local` with at least `FIGMA_TOKEN` and `FIGMA_FILE_KEY`
- PR automation commands require GitHub CLI (`gh`) installed and authenticated
- `npm run build-storybook` builds the static Storybook site, but deployment itself is handled separately by CI or hosting

## How to work with token changes

Typical workflow:

1. Update tokens in Figma.
2. Run `npm run tokens:sync`.
3. Review the diff, mainly in [src/styles/tokens.css](src/styles/tokens.css).
4. Start Storybook and do a quick visual sanity check.
5. Commit + push, or run `npm run tokens:pr`.

## Environment variables

Use [.env.example](.env.example) as a template and create a local `.env.local` file.

Most important variables:

- `FIGMA_TOKEN` - Personal Access Token for the Figma API,
- `FIGMA_FILE_KEY` - Figma file key,
- `BASE_BRANCH` - target branch for token PRs,
- `TOKENS_BRANCH_PREFIX` - prefix for sync branches.

## Team rules

- Do not hardcode color/spacing/radius/typography values if a token exists.
- Treat [src/styles/tokens.css](src/styles/tokens.css) as the frontend source of truth.
- For every larger token change, verify component views in Storybook.
- If you see `unresolved-alias`, it means an alias in source data did not resolve correctly and should be checked in Figma source or transform logic.

## Additional context

A broader project and component overview is available in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).
