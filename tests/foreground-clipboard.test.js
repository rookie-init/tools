import { describe, expect, it, vi } from 'vitest';
import { scheduleForegroundClipboardImport } from '../src/lib/foreground-clipboard.js';

describe('scheduleForegroundClipboardImport', () => {
  it('tries immediately, then retries until one attempt imports clipboard text', async () => {
    vi.useFakeTimers();

    const tryImport = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    scheduleForegroundClipboardImport({
      tryImport,
      retryDelays: [180, 720],
    });

    await Promise.resolve();
    expect(tryImport).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(180);
    expect(tryImport).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(720);
    expect(tryImport).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(1000);
    expect(tryImport).toHaveBeenCalledTimes(3);
  });

  it('cancels pending retries', async () => {
    vi.useFakeTimers();

    const tryImport = vi.fn().mockResolvedValue(false);
    const cancel = scheduleForegroundClipboardImport({
      tryImport,
      retryDelays: [180, 720],
    });

    await Promise.resolve();
    expect(tryImport).toHaveBeenCalledTimes(1);

    cancel();
    await vi.advanceTimersByTimeAsync(1000);

    expect(tryImport).toHaveBeenCalledTimes(1);
  });
});
