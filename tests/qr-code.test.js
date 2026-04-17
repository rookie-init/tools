import { describe, expect, it, vi } from 'vitest';

const { toCanvasMock } = vi.hoisted(() => ({
  toCanvasMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('qrcode', () => ({
  default: {
    toCanvas: toCanvasMock,
  },
}));

import {
  buildQrOptions,
  isLowContrastPair,
  renderQrToCanvas,
  shouldWarnAboutScanability,
} from '../src/lib/qr-code.js';
import { normalizeStylePatch } from '../src/lib/defaults.js';

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

  it('passes text and options separately to qrcode canvas rendering', async () => {
    const canvas = {
      getContext: vi.fn(),
    };

    await renderQrToCanvas(canvas, {
      value: 'hello world',
      size: 320,
      margin: 16,
      foreground: '#000000',
      background: '#ffffff',
      errorCorrectionLevel: 'M',
    });

    expect(toCanvasMock).toHaveBeenCalledWith(
      canvas,
      'hello world',
      expect.objectContaining({
        width: 320,
        margin: 16,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }),
    );
  });
});

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
