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
