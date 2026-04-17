import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readClipboardTextSafely } from '../src/lib/clipboard.js';
import { formatSourceLabel } from '../src/lib/dom.js';

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
