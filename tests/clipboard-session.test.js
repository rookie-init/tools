import { describe, expect, it } from 'vitest';
import {
  createClipboardSession,
  markAppClipboardWrite,
  notePossibleExternalClipboardChange,
  shouldTreatClipboardReadAsStale,
} from '../src/lib/clipboard-session.js';

describe('clipboard session', () => {
  it('treats an app-written clipboard value as stale after the app was backgrounded', () => {
    const session = createClipboardSession();

    markAppClipboardWrite(session, 'from-app');
    notePossibleExternalClipboardChange(session);

    expect(
      shouldTreatClipboardReadAsStale(session, {
        status: 'success',
        text: 'from-app',
      }),
    ).toBe(true);
  });

  it('does not treat different clipboard text as stale', () => {
    const session = createClipboardSession();

    markAppClipboardWrite(session, 'from-app');
    notePossibleExternalClipboardChange(session);

    expect(
      shouldTreatClipboardReadAsStale(session, {
        status: 'success',
        text: 'from-system',
      }),
    ).toBe(false);
  });

  it('does not treat the app copy as stale before any external copy opportunity', () => {
    const session = createClipboardSession();

    markAppClipboardWrite(session, 'from-app');

    expect(
      shouldTreatClipboardReadAsStale(session, {
        status: 'success',
        text: 'from-app',
      }),
    ).toBe(false);
  });
});
