import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addFavoriteItem,
  createEmptyState,
  removeFavoriteItem,
  removeHistoryItem,
  pushHistoryItem,
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

  it('adds favorites once and keeps duplicates out', () => {
    let state = createEmptyState();
    state = addFavoriteItem(state, 'alpha');
    expect(state.favorites).toEqual(['alpha']);
    state = addFavoriteItem(state, 'alpha');
    expect(state.favorites).toEqual(['alpha']);
  });

  it('removes history items by exact value', () => {
    const state = removeHistoryItem(
      {
        ...createEmptyState(),
        history: ['alpha', 'beta'],
      },
      'alpha',
    );

    expect(state.history).toEqual(['beta']);
  });

  it('removes favorite items by exact value', () => {
    const state = removeFavoriteItem(
      {
        ...createEmptyState(),
        favorites: ['alpha', 'beta'],
      },
      'beta',
    );

    expect(state.favorites).toEqual(['alpha']);
  });
});
