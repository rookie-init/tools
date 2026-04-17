import { describe, expect, it } from 'vitest';
import { shouldAutoImportClipboard } from '../src/lib/auto-clipboard.js';

describe('shouldAutoImportClipboard', () => {
  it('blocks clipboard import when auto refresh is disabled', () => {
    expect(
      shouldAutoImportClipboard({
        autoClipboard: false,
        isEditing: false,
        trigger: 'foreground',
      }),
    ).toBe(false);
  });

  it('blocks initial clipboard import while the user is actively editing', () => {
    expect(
      shouldAutoImportClipboard({
        autoClipboard: true,
        isEditing: true,
        trigger: 'load',
      }),
    ).toBe(false);
  });

  it('allows clipboard import when the app returns to foreground even if editing state is stale', () => {
    expect(
      shouldAutoImportClipboard({
        autoClipboard: true,
        isEditing: true,
        trigger: 'foreground',
      }),
    ).toBe(true);
  });
});
