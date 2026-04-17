export function shouldAutoImportClipboard({ autoClipboard, isEditing, trigger }) {
  if (!autoClipboard) return false;

  if (trigger === 'foreground') {
    return true;
  }

  return !isEditing;
}
