import { describe, expect, it } from 'vitest';
import { createShellMarkup, renderMemory, renderSettings } from '../src/lib/dom.js';

describe('createShellMarkup', () => {
  it('removes the extra helper copy and keeps the core controls', () => {
    const markup = createShellMarkup();

    expect(markup).not.toContain('Offline QR Tool');
    expect(markup).not.toContain('Content');
    expect(markup).not.toContain('Edited manually');
    expect(markup).not.toContain('If download is blocked on iPhone');
    expect(markup).toContain('Paste');
    expect(markup).toContain('Clear');
    expect(markup).toContain('Debug');
    expect(markup).toContain('Copy');
    expect(markup).toContain('Save');
    expect(markup).toContain('Favorite');
    expect(markup).not.toContain('Paste and Generate');
    expect(markup).not.toContain('Save PNG');
    expect(markup).not.toContain('Fill Debug Info');
    expect(markup).not.toContain('Copy Debug Info');
    expect(markup).not.toContain('Toggle Favorite');
    expect(markup).not.toContain('action-row-stacked preview-actions');
    expect(markup).not.toContain('controls-actions-debug');
    expect(markup).toContain('data-layout="preview"');
    expect(markup).toContain('data-layout="controls"');
  });
});

describe('renderMemory', () => {
  it('renders memory without the removed heading sentence', () => {
    const markup = renderMemory({
      history: ['one'],
      favorites: ['two'],
    });

    expect(markup).toContain('Memory');
    expect(markup).not.toContain('Keep the strings you use most.');
    expect(markup).not.toContain('<h2>');
    expect(markup).toContain('data-delete-history="one"');
    expect(markup).toContain('data-delete-favorite="two"');
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
