export function resolveStartupValue({ sharedValue, clipboardValue, history }) {
  const candidates = [sharedValue, clipboardValue, history[0] ?? ''];
  return candidates.find((value) => typeof value === 'string' && value.trim()) ?? '';
}
