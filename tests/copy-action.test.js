import { describe, expect, it } from 'vitest';
import { getCopyPayload } from '../src/lib/copy-action.js';

describe('getCopyPayload', () => {
  it('copies the current input value instead of generated debug info', () => {
    expect(
      getCopyPayload({
        inputValue: 'hello-world',
        debugInfo: 'userAgent=debug',
      }),
    ).toBe('hello-world');
  });
});
