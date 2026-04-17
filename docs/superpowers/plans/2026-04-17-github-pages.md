# GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make this Vite app deploy correctly to repository-scoped GitHub Pages at `https://rookie-init.github.io/tools/` while keeping local development rooted at `/`.

**Architecture:** Keep the existing Vite setup intact and add a production-only `base` so built assets resolve under `/tools/` on GitHub Pages. Add a single GitHub Actions workflow that builds `dist/` on pushes to `main` and deploys it with the official Pages actions. Because the working tree already contains unrelated local changes, every commit in this plan stages only the files listed for the task.

**Tech Stack:** Vite 7, Vitest, GitHub Actions, GitHub Pages

---

## File Structure

- Modify: `vite.config.js`
  - Add a production-only `base` value for repository Pages without changing local dev behavior.
- Create: `tests/github-pages-config.test.js`
  - Assert the Vite config contains the expected Pages base-path logic and that the Pages workflow file contains the required triggers and actions.
- Create: `.github/workflows/deploy-pages.yml`
  - Build with npm and deploy the `dist/` artifact to GitHub Pages.

### Task 1: Add a failing test for the GitHub Pages Vite base path

**Files:**
- Create: `tests/github-pages-config.test.js`
- Modify: `vite.config.js`
- Test: `tests/github-pages-config.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/github-pages-config.test.js` with this content:

```js
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('GitHub Pages configuration', () => {
  it('uses /tools/ as the production base while keeping local development at root', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain("base: mode === 'production' ? '/tools/' : '/',");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/github-pages-config.test.js
```

Expected: FAIL because `vite.config.js` does not yet contain `base: mode === 'production' ? '/tools/' : '/',`.

- [ ] **Step 3: Write minimal implementation**

Update `vite.config.js` to:

```js
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/tools/' : '/',
  plugins: [mkcert({ savePath: '.vite-plugin-mkcert' })],
  server: {
    host: true,
    port: 4173,
    https: mode === 'https',
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: ({ name }) => {
          if (name?.endsWith('.css')) return 'assets/app.css';
          return 'assets/[name][extname]';
        },
      },
    },
  },
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/github-pages-config.test.js
```

Expected: PASS with `1 passed`.

- [ ] **Step 5: Commit**

Run:

```bash
git add tests/github-pages-config.test.js vite.config.js
git commit -m "build: add GitHub Pages base path"
```

### Task 2: Add a failing test for the Pages deployment workflow and implement it

**Files:**
- Modify: `tests/github-pages-config.test.js`
- Create: `.github/workflows/deploy-pages.yml`
- Test: `tests/github-pages-config.test.js`

- [ ] **Step 1: Extend the test with workflow assertions**

Append this test block inside `tests/github-pages-config.test.js`:

```js
  it('defines a GitHub Pages deployment workflow for main', () => {
    const workflow = fs.readFileSync(
      path.join(projectRoot, '.github', 'workflows', 'deploy-pages.yml'),
      'utf8',
    );

    expect(workflow).toContain('name: Deploy to GitHub Pages');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('branches: [main]');
    expect(workflow).toContain('uses: actions/setup-node@v4');
    expect(workflow).toContain('run: npm ci');
    expect(workflow).toContain('run: npm run build');
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v3');
    expect(workflow).toContain('path: dist');
    expect(workflow).toContain('uses: actions/deploy-pages@v4');
  });
```

After the append, the full test file should be:

```js
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('GitHub Pages configuration', () => {
  it('uses /tools/ as the production base while keeping local development at root', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain("base: mode === 'production' ? '/tools/' : '/',");
  });

  it('defines a GitHub Pages deployment workflow for main', () => {
    const workflow = fs.readFileSync(
      path.join(projectRoot, '.github', 'workflows', 'deploy-pages.yml'),
      'utf8',
    );

    expect(workflow).toContain('name: Deploy to GitHub Pages');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('branches: [main]');
    expect(workflow).toContain('uses: actions/setup-node@v4');
    expect(workflow).toContain('run: npm ci');
    expect(workflow).toContain('run: npm run build');
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v3');
    expect(workflow).toContain('path: dist');
    expect(workflow).toContain('uses: actions/deploy-pages@v4');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/github-pages-config.test.js
```

Expected: FAIL with an `ENOENT` or similar file-not-found error because `.github/workflows/deploy-pages.yml` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `.github/workflows/deploy-pages.yml` with this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/github-pages-config.test.js
```

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit**

Run:

```bash
git add tests/github-pages-config.test.js .github/workflows/deploy-pages.yml
git commit -m "ci: deploy site to GitHub Pages"
```

### Task 3: Verify the production build emits Pages-safe asset paths

**Files:**
- Modify: none
- Test: `vite.config.js`, `.github/workflows/deploy-pages.yml`, `dist/`

- [ ] **Step 1: Run the targeted tests together**

Run:

```bash
npm test -- tests/github-pages-config.test.js tests/dev-server-config.test.js
```

Expected: PASS with all Pages and dev-server configuration checks green.

- [ ] **Step 2: Run a production build**

Run:

```bash
npm run build
```

Expected: Vite build completes successfully and writes fresh output under `dist/`.

- [ ] **Step 3: Verify the built HTML references the repository base path**

Run:

```bash
rg "/tools/assets/" dist/index.html
```

Expected: A match showing the built HTML references `/tools/assets/...`, confirming the repository Pages base path is in the production bundle.

- [ ] **Step 4: Commit any final tracked changes if needed**

If `npm run build` only updates generated files you do not intend to commit, do not stage them.

If a final commit is needed for touched source files only, run:

```bash
git add vite.config.js tests/github-pages-config.test.js .github/workflows/deploy-pages.yml
git commit -m "chore: finalize GitHub Pages deployment"
```

- [ ] **Step 5: Push and enable Pages in repository settings**

Run:

```bash
git push origin main
```

Then in GitHub:

- open repository Settings
- open Pages
- set Source to `GitHub Actions`

Expected: the `Deploy to GitHub Pages` workflow runs on `main`, and the site publishes at `https://rookie-init.github.io/tools/`.
