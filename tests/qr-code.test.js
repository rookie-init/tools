import { describe, expect, it } from 'vitest';
import { buildQrOptions } from '../src/lib/qr-code.js';

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
});
