export function readSharedValueFromUrl(url = new URL(window.location.href)) {
  const text = url.searchParams.get('text');
  if (text?.trim()) return text.trim();

  const sharedUrl = url.searchParams.get('url');
  if (sharedUrl?.trim()) return sharedUrl.trim();

  return null;
}

export function clearSharedParams(url = new URL(window.location.href)) {
  url.searchParams.delete('text');
  url.searchParams.delete('url');
  window.history.replaceState({}, '', url);
}
