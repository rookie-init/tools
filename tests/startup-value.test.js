import { describe, expect, it } from 'vitest';
import { resolveStartupValue } from '../src/lib/startup-value.js';

describe('resolveStartupValue', () => {
  it('prefers a shared value over every other startup source', () => {
    expect(
      resolveStartupValue({
        sharedValue: 'from-share',
        clipboardValue: 'from-clipboard',
        history: ['from-history'],
      }),
    ).toBe('from-share');
  });

  it('falls back to clipboard text when there is no shared value', () => {
    expect(
      resolveStartupValue({
        sharedValue: '',
        clipboardValue: 'from-clipboard',
        history: ['from-history'],
      }),
    ).toBe('from-clipboard');
  });

  it('uses the newest recent item when share and clipboard are empty', () => {
    expect(
      resolveStartupValue({
        sharedValue: '',
        clipboardValue: '',
        history: ['recent-1', 'recent-2'],
      }),
    ).toBe('recent-1');
  });

  it('returns an empty string when no startup source has a value', () => {
    expect(
      resolveStartupValue({
        sharedValue: '',
        clipboardValue: '',
        history: [],
      }),
    ).toBe('');
  });
});
