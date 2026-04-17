export const DEFAULT_STATE = {
  value: '',
  size: 320,
  margin: 16,
  foreground: '#000000',
  background: '#ffffff',
  errorCorrectionLevel: 'M',
  autoClipboard: true,
  history: [],
  favorites: [],
};

const ERROR_CORRECTION_LEVELS = new Set(['L', 'M', 'Q', 'H']);

export function normalizeStylePatch(patch) {
  const normalized = {};

  if ('size' in patch) {
    normalized.size = Math.max(160, Math.min(640, Number.parseInt(patch.size, 10) || 320));
  }

  if ('margin' in patch) {
    normalized.margin = Math.max(0, Math.min(64, Number.parseInt(patch.margin, 10) || 0));
  }

  if ('foreground' in patch) {
    normalized.foreground = patch.foreground || '#000000';
  }

  if ('background' in patch) {
    normalized.background = patch.background || '#ffffff';
  }

  if ('errorCorrectionLevel' in patch) {
    normalized.errorCorrectionLevel = ERROR_CORRECTION_LEVELS.has(patch.errorCorrectionLevel)
      ? patch.errorCorrectionLevel
      : 'M';
  }

  return normalized;
}
