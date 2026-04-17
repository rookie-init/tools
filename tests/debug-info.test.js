import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  collectDebugInfo,
  formatDebugInfo,
  writeDebugInfoToInput,
} from '../src/lib/debug-info.js';

describe('formatDebugInfo', () => {
  it('formats the key viewport and layout diagnostics into shareable text', () => {
    const output = formatDebugInfo({
      userAgent: 'TestAgent/1.0',
      devicePixelRatio: 2,
      innerWidth: 393,
      innerHeight: 852,
      clientWidth: 393,
      clientHeight: 852,
      scrollWidth: 430,
      scrollHeight: 1200,
      visualViewport: {
        width: 393,
        height: 780,
        scale: 1,
      },
      boxes: {
        body: { width: 393, height: 852, left: 0, top: 0 },
        app: { width: 420, height: 852, left: 0, top: 0 },
        shell: { width: 420, height: 852, left: 0, top: 0 },
        preview: { width: 390, height: 410, left: 12, top: 12 },
        qrCard: { width: 366, height: 366, left: 24, top: 24 },
        canvasRect: { width: 320, height: 320, left: 46, top: 46 },
      },
      canvasBuffer: {
        width: 320,
        height: 320,
      },
    });

    expect(output).toContain('userAgent=TestAgent/1.0');
    expect(output).toContain('viewport.inner=393x852');
    expect(output).toContain('viewport.client=393x852');
    expect(output).toContain('viewport.scroll=430x1200');
    expect(output).toContain('visualViewport=393x780 scale=1');
    expect(output).toContain('body=393x852@0,0');
    expect(output).toContain('app=420x852@0,0');
    expect(output).toContain('qrCard=366x366@24,24');
    expect(output).toContain('canvasRect=320x320@46,46');
    expect(output).toContain('canvasBuffer=320x320');
  });
});

describe('collectDebugInfo', () => {
  it('reads sizes from the current window and layout nodes', () => {
    const nodes = {
      body: { getBoundingClientRect: () => ({ width: 390, height: 844, left: 0, top: 0 }) },
      app: { getBoundingClientRect: () => ({ width: 408, height: 844, left: 0, top: 0 }) },
      shell: { getBoundingClientRect: () => ({ width: 408, height: 844, left: 0, top: 0 }) },
      preview: { getBoundingClientRect: () => ({ width: 384, height: 400, left: 12, top: 12 }) },
      qrCard: { getBoundingClientRect: () => ({ width: 360, height: 360, left: 24, top: 24 }) },
      canvas: {
        width: 320,
        height: 320,
        getBoundingClientRect: () => ({ width: 320, height: 320, left: 44, top: 44 }),
      },
    };

    const doc = {
      body: nodes.body,
      documentElement: {
        clientWidth: 390,
        clientHeight: 844,
        scrollWidth: 412,
        scrollHeight: 900,
      },
      querySelector(selector) {
        return {
          '#app': nodes.app,
          '.app-shell': nodes.shell,
          '.preview-panel': nodes.preview,
          '.qr-card': nodes.qrCard,
          '#qr-canvas': nodes.canvas,
        }[selector] ?? null;
      },
    };

    const win = {
      innerWidth: 390,
      innerHeight: 844,
      devicePixelRatio: 3,
      visualViewport: {
        width: 390,
        height: 700,
        scale: 1.2,
      },
    };

    vi.stubGlobal('navigator', {
      userAgent: 'TestAgent/2.0',
    });

    expect(collectDebugInfo(doc, win)).toEqual({
      userAgent: 'TestAgent/2.0',
      devicePixelRatio: 3,
      innerWidth: 390,
      innerHeight: 844,
      clientWidth: 390,
      clientHeight: 844,
      scrollWidth: 412,
      scrollHeight: 900,
      visualViewport: {
        width: 390,
        height: 700,
        scale: 1.2,
      },
      boxes: {
        body: { width: 390, height: 844, left: 0, top: 0 },
        app: { width: 408, height: 844, left: 0, top: 0 },
        shell: { width: 408, height: 844, left: 0, top: 0 },
        preview: { width: 384, height: 400, left: 12, top: 12 },
        qrCard: { width: 360, height: 360, left: 24, top: 24 },
        canvasRect: { width: 320, height: 320, left: 44, top: 44 },
      },
      canvasBuffer: {
        width: 320,
        height: 320,
      },
    });
  });
});

describe('writeDebugInfoToInput', () => {
  it('replaces the input value with the formatted debug info', () => {
    const input = { value: 'previous' };
    input.value = 'previous';

    const output = writeDebugInfoToInput(input, 'debug-payload');

    expect(output).toBe('debug-payload');
    expect(input.value).toBe('debug-payload');
  });
});
