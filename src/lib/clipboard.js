export async function readClipboardTextResult(readText = navigator.clipboard?.readText?.bind(navigator.clipboard)) {
  if (!readText) {
    return {
      status: 'unavailable',
      text: null,
    };
  }

  try {
    const value = await readText();
    const trimmed = value.trim();

    return {
      status: trimmed ? 'success' : 'empty',
      text: trimmed || null,
    };
  } catch {
    return {
      status: 'denied',
      text: null,
    };
  }
}

export async function readClipboardTextSafely() {
  const result = await readClipboardTextResult();
  return result.status === 'success' ? result.text : null;
}

export async function copyTextSafely(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to selection-based copy.
    }
  }

  if (!document?.body) {
    return false;
  }

  const ghost = document.createElement('textarea');
  ghost.value = text;
  ghost.setAttribute('readonly', 'true');
  ghost.style.position = 'fixed';
  ghost.style.opacity = '0';
  ghost.style.pointerEvents = 'none';
  document.body.append(ghost);
  ghost.select();
  ghost.setSelectionRange(0, ghost.value.length);

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    ghost.remove();
  }
}

export function getPasteButtonLabel(status) {
  if (status === 'empty') {
    return 'Clipboard Empty';
  }

  return 'Tap Input to Paste';
}
