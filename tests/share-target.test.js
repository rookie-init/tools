import { describe, expect, it } from 'vitest';
import { readSharedValueFromUrl } from '../src/lib/share-target.js';

describe('readSharedValueFromUrl', () => {
  it('prefers shared text payloads', () => {
    const url = new URL('https://example.com/?share=ignored&text=hello');
    expect(readSharedValueFromUrl(url)).toBe('hello');
  });

  it('falls back to shared url payloads', () => {
    const url = new URL('https://example.com/?url=https%3A%2F%2Fopenai.com');
    expect(readSharedValueFromUrl(url)).toBe('https://openai.com');
  });
});
