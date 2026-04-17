# HTTPS Dev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a phone-testable HTTPS Vite dev server so clipboard behavior can be verified in a secure context over the local network.

**Architecture:** Keep the production build unchanged and add HTTPS only to local development. Use `vite-plugin-mkcert` to provision a trusted local certificate and expose a dedicated `dev:https` script so HTTP and HTTPS workflows stay explicit.

**Tech Stack:** Vite 7, vite-plugin-mkcert, Vitest

---

### Task 1: Lock the HTTPS dev requirements with tests

**Files:**
- Create: `tests/dev-server-config.test.js`
- Test: `tests/dev-server-config.test.js`

- [ ] **Step 1: Write the failing test**

```js
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('dev server configuration', () => {
  it('defines a dedicated https dev script', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    expect(packageJson.scripts['dev:https']).toBe('vite --mode https');
  });

  it('enables mkcert-backed https in vite config', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');
    expect(viteConfig).toContain(\"import mkcert from 'vite-plugin-mkcert';\");
    expect(viteConfig).toContain('plugins: [mkcert()],');
    expect(viteConfig).toContain(\"https: mode === 'https',\");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/dev-server-config.test.js`
Expected: FAIL because the script, plugin import, and HTTPS flag do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => ({
  plugins: [mkcert()],
  server: {
    host: true,
    port: 4173,
    https: mode === 'https',
  },
}));
```

```json
{
  "scripts": {
    "dev": "vite",
    "dev:https": "vite --mode https"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/dev-server-config.test.js`
Expected: PASS

### Task 2: Install and verify the HTTPS workflow

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.js`
- Test: `tests/dev-server-config.test.js`

- [ ] **Step 1: Install the dependency**

Run: `npm install -D vite-plugin-mkcert`
Expected: `package.json` and `package-lock.json` include `vite-plugin-mkcert`

- [ ] **Step 2: Run the targeted config test**

Run: `npm test -- tests/dev-server-config.test.js`
Expected: PASS

- [ ] **Step 3: Run the full regression suite**

Run: `npm test`
Expected: PASS with all existing tests still green

- [ ] **Step 4: Run the production build**

Run: `npm run build`
Expected: PASS and emit the same production bundle structure

- [ ] **Step 5: Start the HTTPS dev server**

Run: `npm run dev:https -- --host 0.0.0.0`
Expected: Vite starts on `https://<local-ip>:4173/` without changing the build pipeline
