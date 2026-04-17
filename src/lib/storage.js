import { DEFAULT_STATE } from './defaults.js';

const STORAGE_KEY = 'qr-tool-pwa-state';

export function createEmptyState() {
  return structuredClone(DEFAULT_STATE);
}

export function pushHistoryItem(state, value) {
  const trimmed = value.trim();
  if (!trimmed) return state;

  const history = [trimmed, ...state.history.filter((item) => item !== trimmed)].slice(0, 10);
  return { ...state, history };
}

export function addFavoriteItem(state, value) {
  const trimmed = value.trim();
  if (!trimmed) return state;
  if (state.favorites.includes(trimmed)) return state;

  const favorites = [trimmed, ...state.favorites];
  return { ...state, favorites };
}

export function removeHistoryItem(state, value) {
  return {
    ...state,
    history: state.history.filter((item) => item !== value),
  };
}

export function removeFavoriteItem(state, value) {
  return {
    ...state,
    favorites: state.favorites.filter((item) => item !== value),
  };
}

export function loadStoredState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyState();

  try {
    return { ...createEmptyState(), ...JSON.parse(raw) };
  } catch {
    return createEmptyState();
  }
}

export function saveStoredState(state) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      value: state.value,
      size: state.size,
      margin: state.margin,
      foreground: state.foreground,
      background: state.background,
      errorCorrectionLevel: state.errorCorrectionLevel,
      autoClipboard: state.autoClipboard,
      history: state.history,
      favorites: state.favorites,
    }),
  );
}
