import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  copyTextSafely,
  getPasteButtonLabel,
  readClipboardTextResult,
  readClipboardTextSafely,
} from '../src/lib/clipboard.js';

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

describe('readClipboardTextResult', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports unavailable when clipboard access does not exist', async () => {
    await expect(readClipboardTextResult()).resolves.toEqual({
      status: 'unavailable',
      text: null,
    });
  });

  it('reports denied when clipboard access throws', async () => {
    await expect(
      readClipboardTextResult(async () => {
        throw new DOMException('Denied', 'NotAllowedError');
      }),
    ).resolves.toEqual({
      status: 'denied',
      text: null,
    });
  });
});

describe('getPasteButtonLabel', () => {
  it('returns a manual-paste fallback label when clipboard is denied', () => {
    expect(getPasteButtonLabel('denied')).toBe('Tap Input to Paste');
  });

  it('returns an empty-state label when clipboard has no text', () => {
    expect(getPasteButtonLabel('empty')).toBe('Clipboard Empty');
  });
});

describe('copyTextSafely', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the async clipboard api when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText,
      },
    });

    await expect(copyTextSafely('debug-info')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('debug-info');
  });
});
