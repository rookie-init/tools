# QR Tool PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an installable offline QR code PWA that supports arbitrary text input, Android share-target intake, clipboard-first mobile workflows, QR style controls, PNG export, and Apple-inspired presentation from [DESIGN.md](/Users/gup/repo/tools/DESIGN.md).

**Architecture:** Use a Vite-powered vanilla JavaScript single-page app with a small set of focused modules: UI bootstrap, QR rendering, persistence, clipboard/share intake, and PWA wiring. Keep rendering and storage logic pure enough to unit-test with Vitest, while service worker and mobile integration rely on targeted manual verification steps.

**Tech Stack:** Vite, vanilla JavaScript, `qrcode`, Vitest, browser localStorage, Web App Manifest, Service Worker

---

## File Structure

### Runtime files

- Create: `package.json` for scripts and dependencies
- Create: `vite.config.js` for static app configuration
- Create: `index.html` as Vite entry
- Create: `src/main.js` as app bootstrap and event wiring
- Create: `src/styles.css` for the Apple-inspired UI system
- Create: `src/lib/defaults.js` for app defaults and constants
- Create: `src/lib/qr-code.js` for QR rendering, export, and scanability helpers
- Create: `src/lib/storage.js` for state persistence, history, and favorites
- Create: `src/lib/clipboard.js` for guarded clipboard reads
- Create: `src/lib/share-target.js` for Android shared-text intake
- Create: `src/lib/dom.js` for DOM queries and small render helpers
- Create: `public/manifest.webmanifest` for install metadata and `share_target`
- Create: `public/sw.js` for app-shell caching
- Create: `public/icons/icon-192.png` and `public/icons/icon-512.png` as install icons

### Test files

- Create: `tests/qr-code.test.js`
- Create: `tests/dom.test.js`
- Create: `tests/storage.test.js`
- Create: `tests/clipboard.test.js`
- Create: `tests/share-target.test.js`

### Documentation

- Existing: [DESIGN.md](/Users/gup/repo/tools/DESIGN.md)
- Existing: [2026-04-17-qr-tool-pwa-design.md](/Users/gup/repo/tools/docs/superpowers/specs/2026-04-17-qr-tool-pwa-design.md)

## Task 1: Scaffold the Toolchain and Prove the Test Loop

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/styles.css`
- Test: `tests/qr-code.test.js`

- [ ] **Step 1: Write the failing smoke test for QR options**

```js
import { describe, expect, it } from 'vitest';
import { buildQrOptions } from '../src/lib/qr-code.js';

describe('buildQrOptions', () => {
  it('maps app style settings to qrcode options', () => {
    const options = buildQrOptions({
      value: 'https://example.com',
      size: 320,
      margin: 24,
      foreground: '#111111',
      background: '#fafafa',
      errorCorrectionLevel: 'H',
    });

    expect(options.width).toBe(320);
    expect(options.margin).toBe(24);
    expect(options.color.dark).toBe('#111111');
    expect(options.color.light).toBe('#fafafa');
    expect(options.errorCorrectionLevel).toBe('H');
  });
});
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `npm test -- tests/qr-code.test.js`
Expected: FAIL because `package.json` and `src/lib/qr-code.js` do not exist yet

- [ ] **Step 3: Create the project scaffold**

```json
{
  "name": "qr-tool-pwa",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "vitest": "^3.2.0"
  }
}
```

```js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 4173,
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
});
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="stylesheet" href="/src/styles.css" />
    <title>QR Tool</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```js
import './styles.css';

document.querySelector('#app').innerHTML = '<main class="shell">Loading…</main>';
```

```css
:root {
  color-scheme: dark light;
  --color-bg-dark: #000000;
  --color-bg-light: #f5f5f7;
  --color-text-dark: #ffffff;
  --color-text-light: #1d1d1f;
  --color-accent: #0071e3;
  --radius-md: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--color-bg-dark);
  color: var(--color-text-dark);
  font-family: "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.shell {
  padding: 24px;
}
```

- [ ] **Step 4: Add the minimal QR module so the smoke test passes**

```js
export function buildQrOptions({
  value,
  size,
  margin,
  foreground,
  background,
  errorCorrectionLevel,
}) {
  return {
    text: value,
    width: size,
    margin,
    errorCorrectionLevel,
    color: {
      dark: foreground,
      light: background,
    },
  };
}
```

- [ ] **Step 5: Run the smoke test again**

Run: `npm test -- tests/qr-code.test.js`
Expected: PASS with `1 passed`

- [ ] **Step 6: Commit the scaffold**

```bash
git add package.json vite.config.js index.html src/main.js src/styles.css src/lib/qr-code.js tests/qr-code.test.js
git commit -m "chore: scaffold qr tool app"
```

## Task 2: Build the Mobile Shell and Apple-Inspired Layout

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Create: `src/lib/defaults.js`
- Create: `src/lib/dom.js`
- Test: `tests/dom.test.js`

- [ ] **Step 1: Write the failing shell test for the app markup**

```js
import { describe, expect, it } from 'vitest';
import { createShellMarkup } from '../src/lib/dom.js';

describe('createShellMarkup', () => {
  it('includes input, preview, controls, and memory sections', () => {
    const markup = createShellMarkup();

    expect(markup).toContain('data-section="input"');
    expect(markup).toContain('data-section="preview"');
    expect(markup).toContain('data-section="controls"');
    expect(markup).toContain('data-section="memory"');
    expect(markup).toContain('Paste and Generate');
    expect(markup).toContain('Save PNG');
  });
});
```

- [ ] **Step 2: Run the shell test to verify it fails**

Run: `npm test -- tests/dom.test.js`
Expected: FAIL because `src/lib/dom.js` does not exist and the imported symbol cannot be resolved

- [ ] **Step 3: Define app defaults and shell markup**

```js
export const DEFAULT_STATE = {
  value: '',
  size: 320,
  margin: 16,
  foreground: '#000000',
  background: '#ffffff',
  errorCorrectionLevel: 'M',
  autoClipboard: true,
  history: [],
  favorites: [],
};
```

```js
export function createShellMarkup() {
  return `
    <main class="app-shell">
      <section class="hero-panel" data-section="input">
        <div class="hero-copy">
          <p class="eyebrow">Offline QR Tool</p>
          <h1>Create a QR code in one move.</h1>
          <p class="intro">Paste, share, or type any string. The code updates instantly and stays available offline.</p>
        </div>
        <label class="input-panel">
          <span class="label">Content</span>
          <textarea id="qr-input" rows="6" placeholder="Paste text, URL, or any string"></textarea>
        </label>
        <div class="action-row">
          <button id="paste-button" class="button button-primary" type="button">Paste and Generate</button>
          <button id="clear-button" class="button button-secondary" type="button">Clear</button>
        </div>
      </section>
      <section class="preview-panel" data-section="preview">
        <div class="qr-card">
          <canvas id="qr-canvas" width="320" height="320"></canvas>
        </div>
        <p id="source-indicator" class="micro-copy">Ready offline</p>
        <p id="scanability-warning" class="micro-copy warning" hidden></p>
        <div class="action-row action-row-stacked">
          <button id="save-button" class="button button-primary button-wide" type="button">Save PNG</button>
          <button id="favorite-button" class="button button-tertiary button-wide" type="button">Toggle Favorite</button>
        </div>
        <p class="micro-copy">If download is blocked on iPhone, long-press the QR card to save the image.</p>
      </section>
      <section class="settings-panel" data-section="controls"></section>
      <section class="memory-panel" data-section="memory"></section>
    </main>
  `;
}
```

- [ ] **Step 4: Render the shell and styling**

```js
import './styles.css';
import { createShellMarkup } from './lib/dom.js';

document.querySelector('#app').innerHTML = createShellMarkup();
```

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  gap: 20px;
  padding: 20px;
  background:
    linear-gradient(180deg, #000000 0 44%, #f5f5f7 44% 100%);
}

.hero-panel,
.preview-panel,
.settings-panel,
.memory-panel {
  border-radius: 28px;
}

.hero-panel,
.preview-panel {
  background: #000000;
  color: #ffffff;
}

.settings-panel,
.memory-panel {
  background: #f5f5f7;
  color: #1d1d1f;
}

.hero-copy h1 {
  margin: 0;
  font-family: "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(2.25rem, 8vw, 3.5rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.button {
  min-height: 48px;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0 18px;
  font: inherit;
}

.button-primary {
  background: #0071e3;
  color: #ffffff;
}

.button-secondary {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.button-tertiary {
  background: #ffffff;
  color: #1d1d1f;
}

.qr-card {
  display: grid;
  place-items: center;
  min-height: 360px;
  border-radius: 32px;
  background: #ffffff;
  padding: 20px;
}
```

- [ ] **Step 5: Run the shell test to verify it passes**

Run: `npm test -- tests/dom.test.js`
Expected: PASS with `1 passed`

- [ ] **Step 6: Commit the shell work**

```bash
git add index.html src/main.js src/styles.css src/lib/defaults.js src/lib/dom.js tests/dom.test.js
git commit -m "feat: add mobile app shell"
```

## Task 3: Implement QR Rendering, Contrast Checks, and PNG Export

**Files:**
- Modify: `src/lib/qr-code.js`
- Modify: `src/main.js`
- Modify: `src/lib/dom.js`
- Test: `tests/qr-code.test.js`

- [ ] **Step 1: Write the failing QR rendering tests**

```js
import { describe, expect, it } from 'vitest';
import {
  buildQrOptions,
  isLowContrastPair,
  shouldWarnAboutScanability,
} from '../src/lib/qr-code.js';

describe('qr-code helpers', () => {
  it('flags low-contrast foreground/background pairs', () => {
    expect(isLowContrastPair('#d1d1d1', '#ffffff')).toBe(true);
    expect(isLowContrastPair('#000000', '#ffffff')).toBe(false);
  });

  it('warns when contrast is too low for reliable scanning', () => {
    expect(
      shouldWarnAboutScanability({
        foreground: '#e6e6e6',
        background: '#ffffff',
      }),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run the QR tests to verify the new cases fail**

Run: `npm test -- tests/qr-code.test.js`
Expected: FAIL because `isLowContrastPair` and `shouldWarnAboutScanability` are not exported yet

- [ ] **Step 3: Implement QR rendering helpers**

```js
import QRCode from 'qrcode';

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const chunk = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized;

  const int = Number.parseInt(chunk, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function relativeChannel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * relativeChannel(r) +
    0.7152 * relativeChannel(g) +
    0.0722 * relativeChannel(b)
  );
}

export function contrastRatio(foreground, background) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

export function isLowContrastPair(foreground, background) {
  return contrastRatio(foreground, background) < 3.5;
}

export function shouldWarnAboutScanability({ foreground, background }) {
  return isLowContrastPair(foreground, background);
}

export async function renderQrToCanvas(canvas, options) {
  await QRCode.toCanvas(canvas, buildQrOptions(options));
}

export function exportCanvasAsPng(canvas, filename = 'qr-code.png') {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
```

- [ ] **Step 4: Wire QR render and PNG save into the app**

```js
import { DEFAULT_STATE } from './lib/defaults.js';
import { createShellMarkup, getAppElements, renderSettings, renderMemory } from './lib/dom.js';
import { exportCanvasAsPng, renderQrToCanvas, shouldWarnAboutScanability } from './lib/qr-code.js';

const state = { ...DEFAULT_STATE };

document.querySelector('#app').innerHTML = createShellMarkup();
const elements = getAppElements();
elements.settings.innerHTML = renderSettings(state);
elements.memory.innerHTML = renderMemory(state);

async function syncQr() {
  const nextValue = state.value.trim() || ' ';
  await renderQrToCanvas(elements.canvas, {
    value: nextValue,
    size: state.size,
    margin: state.margin,
    foreground: state.foreground,
    background: state.background,
    errorCorrectionLevel: state.errorCorrectionLevel,
  });

  const warning = shouldWarnAboutScanability(state);
  elements.warning.hidden = !warning;
  elements.warning.textContent = warning
    ? 'Low color contrast may make this code harder to scan.'
    : '';
}

elements.saveButton.addEventListener('click', () => {
  exportCanvasAsPng(elements.canvas);
});
```

- [ ] **Step 5: Run the QR tests to verify they pass**

Run: `npm test -- tests/qr-code.test.js`
Expected: PASS with all QR helper cases green

- [ ] **Step 6: Commit the QR rendering work**

```bash
git add src/main.js src/lib/qr-code.js src/lib/dom.js tests/qr-code.test.js
git commit -m "feat: render qr code and export png"
```

## Task 4: Add Style Controls With Immediate Re-rendering

**Files:**
- Modify: `src/lib/dom.js`
- Modify: `src/main.js`
- Modify: `src/lib/defaults.js`
- Test: `tests/qr-code.test.js`

- [ ] **Step 1: Write the failing test for normalized style updates**

```js
import { describe, expect, it } from 'vitest';
import { normalizeStylePatch } from '../src/lib/defaults.js';

describe('normalizeStylePatch', () => {
  it('keeps size and margin in a safe range', () => {
    expect(normalizeStylePatch({ size: '1200', margin: '-4' })).toEqual({
      size: 640,
      margin: 0,
    });
  });

  it('keeps only valid error correction levels', () => {
    expect(normalizeStylePatch({ errorCorrectionLevel: 'X' })).toEqual({
      errorCorrectionLevel: 'M',
    });
  });
});
```

- [ ] **Step 2: Run the style test to verify it fails**

Run: `npm test -- tests/qr-code.test.js`
Expected: FAIL because `normalizeStylePatch` does not exist yet

- [ ] **Step 3: Add normalized style helpers**

```js
const ERROR_CORRECTION_LEVELS = new Set(['L', 'M', 'Q', 'H']);

export function normalizeStylePatch(patch) {
  const normalized = {};

  if ('size' in patch) {
    normalized.size = Math.max(160, Math.min(640, Number.parseInt(patch.size, 10) || 320));
  }

  if ('margin' in patch) {
    normalized.margin = Math.max(0, Math.min(64, Number.parseInt(patch.margin, 10) || 0));
  }

  if ('foreground' in patch) {
    normalized.foreground = patch.foreground || '#000000';
  }

  if ('background' in patch) {
    normalized.background = patch.background || '#ffffff';
  }

  if ('errorCorrectionLevel' in patch) {
    normalized.errorCorrectionLevel = ERROR_CORRECTION_LEVELS.has(patch.errorCorrectionLevel)
      ? patch.errorCorrectionLevel
      : 'M';
  }

  return normalized;
}
```

- [ ] **Step 4: Render and wire the style controls**

```js
export function renderSettings(state) {
  return `
    <div class="panel-header">
      <p class="eyebrow eyebrow-light">Style</p>
      <h2>Adjust the code without leaving the page.</h2>
    </div>
    <div class="control-grid">
      <label class="control">
        <span>Size</span>
        <input id="size-input" type="range" min="160" max="640" step="16" value="${state.size}" />
      </label>
      <label class="control">
        <span>Margin</span>
        <input id="margin-input" type="range" min="0" max="64" step="2" value="${state.margin}" />
      </label>
      <label class="control">
        <span>Foreground</span>
        <input id="foreground-input" type="color" value="${state.foreground}" />
      </label>
      <label class="control">
        <span>Background</span>
        <input id="background-input" type="color" value="${state.background}" />
      </label>
      <label class="control">
        <span>Error Correction</span>
        <select id="error-level-input">
          <option value="L">L</option>
          <option value="M" selected>M</option>
          <option value="Q">Q</option>
          <option value="H">H</option>
        </select>
      </label>
      <label class="control control-toggle">
        <span>Foreground Clipboard Refresh</span>
        <input id="auto-clipboard-input" type="checkbox" ${state.autoClipboard ? 'checked' : ''} />
      </label>
    </div>
  `;
}
```

```js
for (const [key, id] of [
  ['size', '#size-input'],
  ['margin', '#margin-input'],
  ['foreground', '#foreground-input'],
  ['background', '#background-input'],
  ['errorCorrectionLevel', '#error-level-input'],
]) {
  document.querySelector(id).addEventListener('input', async (event) => {
    Object.assign(state, normalizeStylePatch({ [key]: event.target.value }));
    await syncQr();
  });
}

document.querySelector('#auto-clipboard-input').addEventListener('change', (event) => {
  state.autoClipboard = event.target.checked;
  saveStoredState(state);
});
```

- [ ] **Step 5: Run the tests to verify style normalization passes**

Run: `npm test -- tests/qr-code.test.js`
Expected: PASS with style normalization and QR helper cases green

- [ ] **Step 6: Commit the style controls**

```bash
git add src/main.js src/lib/dom.js src/lib/defaults.js tests/qr-code.test.js
git commit -m "feat: add qr style controls"
```

## Task 5: Persist State, History, and Favorites

**Files:**
- Create: `src/lib/storage.js`
- Modify: `src/main.js`
- Modify: `src/lib/dom.js`
- Test: `tests/storage.test.js`

- [ ] **Step 1: Write the failing storage tests**

```js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEmptyState,
  pushHistoryItem,
  toggleFavorite,
} from '../src/lib/storage.js';

describe('storage helpers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('caps history at 10 items and de-duplicates the newest value', () => {
    let state = createEmptyState();
    for (let index = 0; index < 11; index += 1) {
      state = pushHistoryItem(state, `item-${index}`);
    }

    expect(state.history).toHaveLength(10);
    expect(state.history[0]).toBe('item-10');
  });

  it('toggles favorites in place by exact value', () => {
    let state = createEmptyState();
    state = toggleFavorite(state, 'alpha');
    expect(state.favorites).toEqual(['alpha']);
    state = toggleFavorite(state, 'alpha');
    expect(state.favorites).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the storage tests to verify they fail**

Run: `npm test -- tests/storage.test.js`
Expected: FAIL because `src/lib/storage.js` does not exist yet

- [ ] **Step 3: Implement storage helpers**

```js
import { DEFAULT_STATE } from './defaults.js';

const STORAGE_KEY = 'qr-tool-pwa-state';

export function createEmptyState() {
  return structuredClone(DEFAULT_STATE);
}

export function pushHistoryItem(state, value) {
  const trimmed = value.trim();
  if (!trimmed) return state;

  const history = [trimmed, ...state.history.filter((item) => item !== trimmed)].slice(0, 10);
  return { ...state, history };
}

export function toggleFavorite(state, value) {
  const trimmed = value.trim();
  if (!trimmed) return state;

  const favorites = state.favorites.includes(trimmed)
    ? state.favorites.filter((item) => item !== trimmed)
    : [trimmed, ...state.favorites];

  return { ...state, favorites };
}

export function loadStoredState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyState();

  try {
    return { ...createEmptyState(), ...JSON.parse(raw) };
  } catch {
    return createEmptyState();
  }
}

export function saveStoredState(state) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      value: state.value,
      size: state.size,
      margin: state.margin,
      foreground: state.foreground,
      background: state.background,
      errorCorrectionLevel: state.errorCorrectionLevel,
      autoClipboard: state.autoClipboard,
      history: state.history,
      favorites: state.favorites,
    }),
  );
}
```

- [ ] **Step 4: Wire persistence and memory UI**

```js
export function renderMemory(state) {
  const historyItems = state.history.map((item) => `<button class="memory-chip" data-history="${item}">${item}</button>`).join('');
  const favoriteItems = state.favorites.map((item) => `<button class="memory-chip favorite-chip" data-favorite="${item}">${item}</button>`).join('');

  return `
    <div class="panel-header">
      <p class="eyebrow eyebrow-light">Memory</p>
      <h2>Keep the strings you use most.</h2>
    </div>
    <div class="memory-group">
      <p class="label-light">Favorites</p>
      <div class="chip-list">${favoriteItems || '<p class="empty-copy">No favorites yet.</p>'}</div>
    </div>
    <div class="memory-group">
      <p class="label-light">Recent</p>
      <div class="chip-list">${historyItems || '<p class="empty-copy">No recent items yet.</p>'}</div>
    </div>
  `;
}
```

```js
import {
  loadStoredState,
  pushHistoryItem,
  saveStoredState,
  toggleFavorite,
} from './lib/storage.js';

const state = loadStoredState();

async function applyValue(nextValue, source) {
  state.value = nextValue;
  Object.assign(state, pushHistoryItem(state, nextValue));
  elements.input.value = state.value;
  elements.sourceIndicator.textContent = source;
  renderMemorySection();
  saveStoredState(state);
  await syncQr();
}

elements.favoriteButton.addEventListener('click', () => {
  Object.assign(state, toggleFavorite(state, state.value));
  renderMemorySection();
  saveStoredState(state);
});

elements.memory.addEventListener('click', async (event) => {
  const historyValue = event.target.closest('[data-history]')?.dataset.history;
  const favoriteValue = event.target.closest('[data-favorite]')?.dataset.favorite;

  if (historyValue) {
    await applyValue(historyValue, 'Loaded from recent history');
  }

  if (favoriteValue) {
    await applyValue(favoriteValue, 'Loaded from favorites');
  }
});
```

- [ ] **Step 5: Run the storage tests to verify they pass**

Run: `npm test -- tests/storage.test.js`
Expected: PASS with all storage cases green

- [ ] **Step 6: Commit persistence and memory**

```bash
git add src/main.js src/lib/dom.js src/lib/storage.js tests/storage.test.js
git commit -m "feat: persist qr history and favorites"
```

## Task 6: Add Clipboard Intake, Foreground Refresh, and Manual Paste Fallback

**Files:**
- Create: `src/lib/clipboard.js`
- Modify: `src/main.js`
- Test: `tests/clipboard.test.js`

- [ ] **Step 1: Write the failing clipboard tests**

```js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readClipboardTextSafely } from '../src/lib/clipboard.js';

describe('readClipboardTextSafely', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when clipboard access is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    await expect(readClipboardTextSafely()).resolves.toBeNull();
  });

  it('returns text when readText succeeds', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockResolvedValue('from-clipboard'),
      },
    });

    await expect(readClipboardTextSafely()).resolves.toBe('from-clipboard');
  });
});
```

- [ ] **Step 2: Run the clipboard tests to verify they fail**

Run: `npm test -- tests/clipboard.test.js`
Expected: FAIL because `src/lib/clipboard.js` does not exist yet

- [ ] **Step 3: Implement guarded clipboard access**

```js
export async function readClipboardTextSafely() {
  if (!navigator.clipboard?.readText) {
    return null;
  }

  try {
    const value = await navigator.clipboard.readText();
    const trimmed = value.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Wire startup, foreground, and manual paste behavior**

```js
import { readClipboardTextSafely } from './lib/clipboard.js';

let isEditing = false;

elements.input.addEventListener('focus', () => {
  isEditing = true;
});

elements.input.addEventListener('blur', () => {
  isEditing = false;
});

elements.input.addEventListener('input', async (event) => {
  state.value = event.target.value;
  saveStoredState(state);
  await syncQr();
});

async function tryClipboardImport(source) {
  if (!state.autoClipboard || isEditing) return;
  const nextValue = await readClipboardTextSafely();
  if (!nextValue || nextValue === state.value) return;
  await applyValue(nextValue, source);
}

elements.pasteButton.addEventListener('click', async () => {
  const nextValue = await readClipboardTextSafely();
  if (nextValue) {
    await applyValue(nextValue, 'Pasted from clipboard');
  }
});

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    await tryClipboardImport('Updated from clipboard');
  }
});

await tryClipboardImport('Loaded from clipboard');
```

- [ ] **Step 5: Run the clipboard tests to verify they pass**

Run: `npm test -- tests/clipboard.test.js`
Expected: PASS with clipboard success and failure cases green

- [ ] **Step 6: Commit clipboard behavior**

```bash
git add src/main.js src/lib/clipboard.js tests/clipboard.test.js
git commit -m "feat: add clipboard import workflow"
```

## Task 7: Add Android Share Target Intake and PWA Assets

**Files:**
- Create: `src/lib/share-target.js`
- Modify: `src/main.js`
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Test: `tests/share-target.test.js`

- [ ] **Step 1: Write the failing share-target tests**

```js
import { describe, expect, it } from 'vitest';
import { readSharedValueFromUrl } from '../src/lib/share-target.js';

describe('readSharedValueFromUrl', () => {
  it('prefers shared text payloads', () => {
    const url = new URL('https://example.com/?share=ignored&text=hello');
    expect(readSharedValueFromUrl(url)).toBe('hello');
  });

  it('falls back to shared url payloads', () => {
    const url = new URL('https://example.com/?url=https%3A%2F%2Fopenai.com');
    expect(readSharedValueFromUrl(url)).toBe('https://openai.com');
  });
});
```

- [ ] **Step 2: Run the share-target tests to verify they fail**

Run: `npm test -- tests/share-target.test.js`
Expected: FAIL because `src/lib/share-target.js` does not exist yet

- [ ] **Step 3: Implement share-target parsing**

```js
export function readSharedValueFromUrl(url = new URL(window.location.href)) {
  const text = url.searchParams.get('text');
  if (text?.trim()) return text.trim();

  const sharedUrl = url.searchParams.get('url');
  if (sharedUrl?.trim()) return sharedUrl.trim();

  return null;
}

export function clearSharedParams(url = new URL(window.location.href)) {
  url.searchParams.delete('text');
  url.searchParams.delete('url');
  window.history.replaceState({}, '', url);
}
```

- [ ] **Step 4: Add PWA manifest and service worker**

```json
{
  "name": "QR Tool",
  "short_name": "QR Tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "share_target": {
    "action": "/",
    "method": "GET",
    "enctype": "application/x-www-form-urlencoded",
    "params": {
      "text": "text",
      "url": "url"
    }
  }
}
```

```js
const CACHE_NAME = 'qr-tool-shell-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/app.css',
  '/assets/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      ),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
```

- [ ] **Step 5: Wire share-target intake and service worker registration**

```js
import { clearSharedParams, readSharedValueFromUrl } from './lib/share-target.js';

const sharedValue = readSharedValueFromUrl();
if (sharedValue) {
  await applyValue(sharedValue, 'Imported from Android share sheet');
  clearSharedParams();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

- [ ] **Step 6: Run the share-target tests to verify they pass**

Run: `npm test -- tests/share-target.test.js`
Expected: PASS with both text and URL intake cases green

- [ ] **Step 7: Commit the PWA wiring**

```bash
git add src/main.js src/lib/share-target.js public/manifest.webmanifest public/sw.js public/icons/icon-192.png public/icons/icon-512.png tests/share-target.test.js
git commit -m "feat: add pwa share target support"
```

## Task 8: Polish the Final UX, Verify Build, and Run Manual Device Checks

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `src/lib/dom.js`
- Modify: `public/sw.js`
- Test: `tests/dom.test.js`
- Test: `tests/storage.test.js`
- Test: `tests/clipboard.test.js`
- Test: `tests/share-target.test.js`

- [ ] **Step 1: Write the failing test for user-facing source labels**

```js
import { describe, expect, it } from 'vitest';
import { formatSourceLabel } from '../src/lib/dom.js';

describe('formatSourceLabel', () => {
  it('returns a concise default label for offline-ready state', () => {
    expect(formatSourceLabel(null)).toBe('Ready offline');
  });

  it('returns the provided source copy when present', () => {
    expect(formatSourceLabel('Imported from Android share sheet')).toBe(
      'Imported from Android share sheet',
    );
  });
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `npm test -- tests/dom.test.js`
Expected: FAIL because `formatSourceLabel` does not exist yet

- [ ] **Step 3: Add final UX polish for labels, empty state, and action affordances**

```js
export function formatSourceLabel(source) {
  return source || 'Ready offline';
}
```

```css
.micro-copy {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.33;
  letter-spacing: -0.08px;
}

.warning {
  color: #2997ff;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.memory-chip {
  min-height: 38px;
  border: 0;
  border-radius: 999px;
  padding: 0 14px;
  background: #ffffff;
  color: #1d1d1f;
}
```

- [ ] **Step 4: Run the full automated test suite**

Run: `npm test`
Expected: PASS with `tests/qr-code.test.js`, `tests/dom.test.js`, `tests/storage.test.js`, `tests/clipboard.test.js`, and `tests/share-target.test.js` all green

- [ ] **Step 5: Build the production app**

Run: `npm run build`
Expected: PASS with a generated `dist/` directory and no build errors

- [ ] **Step 6: Manually verify the required mobile behaviors**

Run:

```bash
npm run dev
```

Expected manual checks:

- Desktop browser renders the four sections and QR updates on input
- "Paste and Generate" still works after a denied clipboard read
- Refresh preserves styles, history, and favorites
- DevTools application tab shows the manifest and registered service worker
- Android device or emulator can install the PWA and invoke it from the share sheet
- iPhone home-screen install can relaunch offline and attempt clipboard import on foreground resume

- [ ] **Step 7: Commit the final polish**

```bash
git add src/main.js src/styles.css src/lib/dom.js public/sw.js tests/qr-code.test.js tests/dom.test.js tests/storage.test.js tests/clipboard.test.js tests/share-target.test.js
git commit -m "feat: finish qr tool pwa"
```
