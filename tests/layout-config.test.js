import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE } from '../src/lib/defaults.js';
import { renderSettings } from '../src/lib/dom.js';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('layout configuration', () => {
  it('disables page zoom in the viewport meta tag', () => {
    const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

    expect(indexHtml).toContain(
      'content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1, user-scalable=no"',
    );
  });

  it('uses a shell width that matches the current visible width constraints', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).toContain('width: 100%;');
    expect(styles).not.toContain('width: 100vw;');
    expect(styles).toContain('max-width: 100%;');
  });

  it('does not force the body wider than the visible viewport', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).not.toContain('min-width: 320px;');
  });

  it('does not enforce a fixed minimum button width in the layout shell', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).not.toContain('min-width: 148px;');
  });

  it('lets long unbroken text shrink and wrap inside the mobile grid layout', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).toContain('min-width: 0;');
    expect(styles).toContain('overflow-wrap: anywhere;');
  });

  it('lets recent and favorite chips wrap without widening their container', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).toContain('.chip-list');
    expect(styles).toContain('.memory-chip');
    expect(styles).toContain('white-space: normal;');
    expect(styles).toContain('max-width: 100%;');
  });

  it('keeps preview actions side by side and tightens the memory spacing', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).toContain('.preview-actions {');
    expect(styles).toContain('display: grid;');
    expect(styles).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
    expect(styles).toContain('.memory-panel {');
    expect(styles).toContain('border-radius: 0;');
    expect(styles).toContain('padding: 12px 16px 14px;');
    expect(styles).toContain('.memory-group {');
    expect(styles).toContain('gap: 8px;');
  });

  it('keeps the four input actions in a single compact row', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).toContain('.controls-actions {');
    expect(styles).toContain('grid-template-columns: repeat(4, minmax(0, 1fr));');
  });

  it('keeps the controls wrapper transparent so the memory panel shape is visible', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).toContain('.controls-panel {');
    expect(styles).toContain('background: transparent;');
    expect(styles).toContain('border-radius: 0;');
  });

  it('uses a fixed 3px radius for recent and favorite memory items', () => {
    const styles = fs.readFileSync(path.join(projectRoot, 'src/styles.css'), 'utf8');

    expect(styles).toContain('.memory-chip-row {');
    expect(styles).toContain('border-radius: 3px;');
  });

  it('defaults qr margin to the minimum value', () => {
    expect(DEFAULT_STATE.margin).toBe(0);

    const markup = renderSettings({
      ...DEFAULT_STATE,
      isStyleExpanded: true,
    });

    expect(markup).toContain('id="margin-input" type="range" min="0" max="64" step="2" value="0"');
  });
});
