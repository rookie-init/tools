# QR Tool Layout Tightening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the QR Tool layout so mobile becomes QR-first, desktop swaps to QR-left / controls-right, the Style panel is collapsed by default, and the specified helper copy is removed.

**Architecture:** Keep the current single-page structure and change only layout/state presentation layers. The implementation should stay inside the existing DOM builder, app bootstrap, and stylesheet, with one small UI state addition for Style collapse so the behavior remains simple and testable.

**Tech Stack:** Vite, vanilla JavaScript, Vitest, existing DOM-string render helpers, CSS Grid/Flexbox

---

## File Structure

### Runtime files

- Modify: `src/lib/dom.js` to remove the specified copy, restructure the shell markup, and add a collapsed/expanded Style section renderer
- Modify: `src/main.js` to track Style section expansion state and wire the disclosure button without touching QR logic
- Modify: `src/styles.css` to swap desktop columns, tighten spacing, increase QR dominance, and define collapsed Style presentation

### Test files

- Modify: `tests/dom.test.js` to cover copy removal and collapsed Style markup

### Docs

- Existing: [2026-04-17-qr-tool-layout-tightening-design.md](/Users/gup/repo/tools/docs/superpowers/specs/2026-04-17-qr-tool-layout-tightening-design.md)
- Existing: [2026-04-17-qr-tool-pwa-design.md](/Users/gup/repo/tools/docs/superpowers/specs/2026-04-17-qr-tool-pwa-design.md)
- Existing: [DESIGN.md](/Users/gup/repo/tools/DESIGN.md)

## Task 1: Lock the Tightened Structure With Failing DOM Tests

**Files:**
- Modify: `tests/dom.test.js`
- Test: `tests/dom.test.js`

- [ ] **Step 1: Replace the DOM test with layout-tightening expectations**

```js
import { describe, expect, it } from 'vitest';
import { createShellMarkup, renderSettings } from '../src/lib/dom.js';

describe('createShellMarkup', () => {
  it('removes the extra helper copy and keeps the core controls', () => {
    const markup = createShellMarkup();

    expect(markup).not.toContain('Offline QR Tool');
    expect(markup).not.toContain('Content');
    expect(markup).not.toContain('Edited manually');
    expect(markup).not.toContain('If download is blocked on iPhone');
    expect(markup).toContain('Paste and Generate');
    expect(markup).toContain('Save PNG');
    expect(markup).toContain('data-layout="preview"');
    expect(markup).toContain('data-layout="controls"');
  });
});

describe('renderSettings', () => {
  it('renders the style panel collapsed by default', () => {
    const markup = renderSettings({
      size: 320,
      margin: 16,
      foreground: '#000000',
      background: '#ffffff',
      errorCorrectionLevel: 'M',
      autoClipboard: true,
      isStyleExpanded: false,
    });

    expect(markup).toContain('data-style-expanded="false"');
    expect(markup).toContain('Style');
    expect(markup).not.toContain('Size');
    expect(markup).not.toContain('Foreground Clipboard Refresh');
  });

  it('renders full style controls when expanded', () => {
    const markup = renderSettings({
      size: 320,
      margin: 16,
      foreground: '#000000',
      background: '#ffffff',
      errorCorrectionLevel: 'M',
      autoClipboard: true,
      isStyleExpanded: true,
    });

    expect(markup).toContain('data-style-expanded="true"');
    expect(markup).toContain('Size');
    expect(markup).toContain('Foreground');
    expect(markup).toContain('Background');
    expect(markup).toContain('Foreground Clipboard Refresh');
  });
});
```

- [ ] **Step 2: Run the DOM test to verify it fails**

Run: `npm test -- tests/dom.test.js`
Expected: FAIL because the current markup still contains the removed copy and `renderSettings()` always renders expanded controls

- [ ] **Step 3: Commit the failing-test checkpoint**

```bash
git add tests/dom.test.js
git commit -m "test: cover tightened qr tool layout"
```

## Task 2: Restructure the Shell for QR-First Mobile and QR-Left Desktop

**Files:**
- Modify: `src/lib/dom.js`
- Modify: `src/main.js`
- Test: `tests/dom.test.js`

- [ ] **Step 1: Implement the tightened shell markup**

```js
export function createShellMarkup() {
  return `
    <main class="app-shell">
      <section class="preview-panel" data-section="preview" data-layout="preview">
        <div class="qr-card qr-card-dominant">
          <canvas id="qr-canvas" width="320" height="320"></canvas>
        </div>
        <div class="action-row action-row-stacked preview-actions">
          <button id="save-button" class="button button-primary button-wide" type="button">Save PNG</button>
          <button id="favorite-button" class="button button-tertiary button-wide" type="button">Toggle Favorite</button>
        </div>
        <p id="scanability-warning" class="micro-copy warning" hidden></p>
      </section>

      <section class="controls-panel" data-section="input" data-layout="controls">
        <label class="input-panel input-panel-tight">
          <textarea id="qr-input" rows="5" placeholder="Paste text, URL, or any string"></textarea>
        </label>
        <div class="action-row controls-actions">
          <button id="paste-button" class="button button-primary" type="button">Paste and Generate</button>
          <button id="clear-button" class="button button-secondary" type="button">Clear</button>
        </div>
        <section class="settings-panel" data-section="controls"></section>
        <section class="memory-panel" data-section="memory"></section>
      </section>
    </main>
  `;
}
```

- [ ] **Step 2: Update element lookup for the new shell**

```js
export function getAppElements() {
  return {
    input: document.querySelector('#qr-input'),
    canvas: document.querySelector('#qr-canvas'),
    warning: document.querySelector('#scanability-warning'),
    pasteButton: document.querySelector('#paste-button'),
    clearButton: document.querySelector('#clear-button'),
    saveButton: document.querySelector('#save-button'),
    favoriteButton: document.querySelector('#favorite-button'),
    settings: document.querySelector('.settings-panel'),
    memory: document.querySelector('.memory-panel'),
  };
}
```

- [ ] **Step 3: Remove the obsolete source-label wiring from the app bootstrap**

```js
function renderMemorySection() {
  elements.memory.innerHTML = renderMemory(state);
}

function renderSettingsSection() {
  elements.settings.innerHTML = renderSettings(state);
  bindSettingControls();
  bindStyleToggle();
}

async function applyValue(nextValue) {
  state.value = nextValue;
  Object.assign(state, pushHistoryItem(state, nextValue));
  elements.input.value = state.value;
  renderMemorySection();
  saveStoredState(state);
  await syncQr();
}

elements.input.addEventListener('input', async (event) => {
  state.value = event.target.value;
  saveStoredState(state);
  await syncQr();
});

elements.clearButton.addEventListener('click', async () => {
  state.value = '';
  elements.input.value = '';
  saveStoredState(state);
  await syncQr();
});
```

- [ ] **Step 4: Run the DOM test to verify the shell passes and the Style test still fails**

Run: `npm test -- tests/dom.test.js`
Expected: FAIL only on the collapsed-Style expectations, while the copy-removal and layout-marker expectations now pass

- [ ] **Step 5: Commit the shell restructuring**

```bash
git add src/lib/dom.js src/main.js tests/dom.test.js
git commit -m "feat: tighten qr shell layout"
```

## Task 3: Add a Collapsed-by-Default Style Panel

**Files:**
- Modify: `src/lib/dom.js`
- Modify: `src/main.js`
- Test: `tests/dom.test.js`

- [ ] **Step 1: Render a collapsed Style disclosure by default**

```js
function renderStyleControls(state) {
  return `
    <div class="control-grid">
      <label class="control">
        <span class="label-light">Size</span>
        <input id="size-input" type="range" min="160" max="640" step="16" value="${state.size}" />
      </label>
      <label class="control">
        <span class="label-light">Margin</span>
        <input id="margin-input" type="range" min="0" max="64" step="2" value="${state.margin}" />
      </label>
      <label class="control">
        <span class="label-light">Foreground</span>
        <input id="foreground-input" type="color" value="${state.foreground}" />
      </label>
      <label class="control">
        <span class="label-light">Background</span>
        <input id="background-input" type="color" value="${state.background}" />
      </label>
      <label class="control">
        <span class="label-light">Error Correction</span>
        <select id="error-level-input">
          <option value="L" ${state.errorCorrectionLevel === 'L' ? 'selected' : ''}>L</option>
          <option value="M" ${state.errorCorrectionLevel === 'M' ? 'selected' : ''}>M</option>
          <option value="Q" ${state.errorCorrectionLevel === 'Q' ? 'selected' : ''}>Q</option>
          <option value="H" ${state.errorCorrectionLevel === 'H' ? 'selected' : ''}>H</option>
        </select>
      </label>
      <label class="control control-toggle">
        <span class="label-light">Foreground Clipboard Refresh</span>
        <input id="auto-clipboard-input" type="checkbox" ${state.autoClipboard ? 'checked' : ''} />
      </label>
    </div>
  `;
}

export function renderSettings(state) {
  const expanded = Boolean(state.isStyleExpanded);

  return `
    <div class="style-disclosure" data-style-expanded="${expanded}">
      <button id="style-toggle-button" class="style-toggle" type="button" aria-expanded="${expanded}">
        <span class="eyebrow eyebrow-light">Style</span>
        <span class="style-toggle-icon">${expanded ? '−' : '+'}</span>
      </button>
      ${expanded ? renderStyleControls(state) : ''}
    </div>
  `;
}
```

- [ ] **Step 2: Track collapse state in the app bootstrap**

```js
const state = {
  ...DEFAULT_STATE,
  ...loadStoredState(),
  isStyleExpanded: false,
};

function renderSettingsSection() {
  elements.settings.innerHTML = renderSettings(state);
  bindSettingControls();
  bindStyleToggle();
}

function bindStyleToggle() {
  document.querySelector('#style-toggle-button').addEventListener('click', () => {
    state.isStyleExpanded = !state.isStyleExpanded;
    renderSettingsSection();
  });
}

function bindSettingControls() {
  if (!state.isStyleExpanded) return;

  for (const [key, id] of [
    ['size', '#size-input'],
    ['margin', '#margin-input'],
    ['foreground', '#foreground-input'],
    ['background', '#background-input'],
    ['errorCorrectionLevel', '#error-level-input'],
  ]) {
    document.querySelector(id).addEventListener('input', async (event) => {
      Object.assign(state, normalizeStylePatch({ [key]: event.target.value }));
      saveStoredState(state);
      await syncQr();
    });
  }

  document.querySelector('#auto-clipboard-input').addEventListener('change', (event) => {
    state.autoClipboard = event.target.checked;
    saveStoredState(state);
  });
}
```

- [ ] **Step 3: Run the DOM test to verify all expectations pass**

Run: `npm test -- tests/dom.test.js`
Expected: PASS with all collapsed/expanded layout assertions green

- [ ] **Step 4: Commit the Style disclosure**

```bash
git add src/lib/dom.js src/main.js tests/dom.test.js
git commit -m "feat: collapse qr style controls by default"
```

## Task 4: Tighten Spacing and Swap Desktop Emphasis in CSS

**Files:**
- Modify: `src/styles.css`
- Test: `tests/dom.test.js`

- [ ] **Step 1: Rewrite layout and spacing rules for the tighter shell**

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(180deg, #000000 0 40%, #f5f5f7 40% 100%);
}

.preview-panel,
.controls-panel,
.settings-panel,
.memory-panel {
  border-radius: 24px;
}

.preview-panel {
  display: grid;
  gap: 10px;
  padding: 14px;
  background: #000000;
  color: #ffffff;
}

.controls-panel {
  display: grid;
  gap: 12px;
  padding: 0;
}

.input-panel-tight {
  gap: 0;
}

#qr-input {
  min-height: 112px;
  border-radius: 16px;
  padding: 14px;
}

.qr-card-dominant {
  min-height: min(68vw, 420px);
  padding: 10px;
  border-radius: 28px;
}

#qr-canvas {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 1 / 1;
}

.preview-actions {
  gap: 8px;
}

.controls-actions {
  gap: 8px;
}

.style-toggle {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: 18px;
  padding: 0 16px;
  background: #f5f5f7;
  color: #1d1d1f;
}

.style-disclosure[data-style-expanded="true"] {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .app-shell {
    max-width: 1180px;
    margin: 0 auto;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
    gap: 16px;
    align-items: start;
  }

  .preview-panel {
    grid-column: 1;
    position: sticky;
    top: 12px;
  }

  .controls-panel {
    grid-column: 2;
    align-content: start;
  }

  .qr-card-dominant {
    min-height: 520px;
    padding: 14px;
  }
}
```

- [ ] **Step 2: Run the DOM test to guard against layout markup regressions**

Run: `npm test -- tests/dom.test.js`
Expected: PASS

- [ ] **Step 3: Commit the CSS tightening**

```bash
git add src/styles.css tests/dom.test.js
git commit -m "feat: make qr layout denser and qr-first"
```

## Task 5: Full Verification and Browser Smoke Check

**Files:**
- Modify: `src/lib/dom.js`
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Test: `tests/dom.test.js`
- Test: `tests/qr-code.test.js`
- Test: `tests/storage.test.js`
- Test: `tests/clipboard.test.js`
- Test: `tests/share-target.test.js`

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`
Expected: PASS with all test files green and no new failures outside `tests/dom.test.js`

- [ ] **Step 2: Build the production app**

Run: `npm run build`
Expected: PASS with a fresh `dist/` output and no build errors

- [ ] **Step 3: Run a browser smoke check for the tightened layout**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected manual checks:

- mobile-width viewport shows QR first, then action buttons, then textarea
- desktop-width viewport shows QR on the left and controls on the right
- Style renders collapsed by default
- removed strings no longer appear anywhere in the UI
- QR still renders, saves, and responds to input/style changes after expanding Style

- [ ] **Step 4: Commit the verified layout pass**

```bash
git add src/lib/dom.js src/main.js src/styles.css tests/dom.test.js tests/qr-code.test.js tests/storage.test.js tests/clipboard.test.js tests/share-target.test.js
git commit -m "feat: tighten qr tool layout"
```
