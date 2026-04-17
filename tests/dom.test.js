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
