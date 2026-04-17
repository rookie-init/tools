export async function readClipboardTextSafely() {
  if (!navigator.clipboard?.readText) {
    return null;
  }

  try {
    const value = await navigator.clipboard.readText();
    const trimmed = value.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}
