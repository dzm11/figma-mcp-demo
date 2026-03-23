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

## Most important file: src/styles/tokens.css

The file [src/styles/tokens.css](src/styles/tokens.css) is the final, app-facing token output.

That means:

- components and global styles read tokens from this file,
- Storybook imports the same file, so previews reflect the real design system state,
- this file should not be edited manually, because it is generated.

Related places:

- [src/index.css](src/index.css) imports tokens globally,
- [.storybook/preview.ts](.storybook/preview.ts) imports tokens for stories,
- [src/styles/generated/_tokens.scss](src/styles/generated/_tokens.scss) is an internal helper SCSS artifact.

## Folder architecture

- [src/components](src/components) - UI components (TSX + CSS Modules + types)
- [src/styles](src/styles) - global styles, tokens, and fonts
- [src/stories](src/stories) - Storybook stories
- [src/assets](src/assets) - SVG/PNG assets
- [scripts](scripts) - token pipeline (pull/build/sync/pr)
- [config/tokens.config.json](config/tokens.config.json) - token generator configuration
- [tokens/tokens.source.json](tokens/tokens.source.json) - normalized source data fetched from Figma

## Commands

### Development

- `npm run dev` - run the app locally
- `npm run storybook` - run Storybook
- `npm run build` - production build
- `npm run lint` - lint

### Token pipeline

- `npm run tokens:pull` - fetch Variables from Figma into source JSON
- `npm run tokens:build` - generate `src/styles/tokens.css` and `src/styles/generated/_tokens.scss`
- `npm run tokens:sync` - pull + build
- `npm run tokens:pr` - sync + commit/push + create PR (requires `gh`)

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
