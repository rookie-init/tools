import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEmptyState,
  pushHistoryItem,
  toggleFavorite,
} from '../src/lib/storage.js';

describe('storage helpers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('caps history at 10 items and de-duplicates the newest value', () => {
    let state = createEmptyState();
    for (let index = 0; index < 11; index += 1) {
      state = pushHistoryItem(state, `item-${index}`);
    }

    expect(state.history).toHaveLength(10);
    expect(state.history[0]).toBe('item-10');
  });

  it('toggles favorites in place by exact value', () => {
    let state = createEmptyState();
    state = toggleFavorite(state, 'alpha');
    expect(state.favorites).toEqual(['alpha']);
    state = toggleFavorite(state, 'alpha');
    expect(state.favorites).toEqual([]);
  });
});
