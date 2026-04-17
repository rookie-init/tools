# GitHub Pages Deployment Design

Date: 2026-04-17

## Goal

Deploy this Vite application to repository-scoped GitHub Pages at:

`https://rookie-init.github.io/tools/`

The deployment should work without changing local development behavior.

## Constraints

- The project already uses Vite for development and production builds.
- Local development should continue to run from `/`.
- Production builds for GitHub Pages must resolve assets under `/tools/`.
- The deployment mechanism should avoid adding third-party publish tooling when GitHub Actions can handle the build and deploy steps directly.

## Recommended Approach

Use GitHub Actions as the Pages deployment source and configure Vite to use a production-only base path.

This keeps local development unchanged while making the built assets compatible with repository-scoped Pages hosting.

## Changes

### 1. Vite Base Path

Update `vite.config.js` so that:

- development uses `base: '/'`
- production uses `base: '/tools/'`

This ensures:

- `vite` and `vite preview` continue to behave normally in local development
- the built `index.html` and asset references point to `/tools/...` in production output

### 2. GitHub Pages Workflow

Add a workflow at `.github/workflows/deploy-pages.yml` that:

- runs on pushes to `main`
- supports manual runs via `workflow_dispatch`
- installs dependencies with `npm ci`
- builds with `npm run build`
- uploads the `dist/` directory as the Pages artifact
- deploys with the official GitHub Pages actions

The workflow should use:

- `actions/checkout`
- `actions/setup-node`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

No separate `gh-pages` branch or npm package-based deploy flow is needed.

### 3. Repository Settings

In GitHub repository settings, Pages should use:

- Source: `GitHub Actions`

No code change is required for this step, but the workflow depends on it.

## Data Flow

1. A commit is pushed to `main`.
2. GitHub Actions checks out the repository.
3. The workflow installs dependencies and runs the Vite production build.
4. Vite emits a `dist/` bundle with asset URLs rooted at `/tools/`.
5. The Pages deploy action publishes the artifact.
6. The site becomes available at `https://rookie-init.github.io/tools/`.

## Error Handling

- If `npm ci` fails, deployment stops before build.
- If `npm run build` fails, no artifact is uploaded.
- If Pages is not configured to use `GitHub Actions`, the deploy job may complete incorrectly or remain unavailable until repository settings are fixed.
- If the production `base` is incorrect, the site may load HTML successfully while CSS or JavaScript returns 404s from the wrong path.

## Testing And Verification

Verification for this change should include:

- running `npm run build`
- confirming the build completes successfully
- confirming the generated output references `/tools/` for production assets
- after workflow setup, verifying the GitHub Actions deployment succeeds
- verifying the live Pages URL loads correctly

## Scope

In scope:

- Vite production base-path configuration
- GitHub Pages workflow setup
- deployment instructions tied to repository Pages

Out of scope:

- custom domains
- user/organization Pages root hosting
- broader refactoring of the build setup
- changes to runtime application behavior unrelated to deployment
