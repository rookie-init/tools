export const FOREGROUND_CLIPBOARD_RETRY_DELAYS = [180, 720];

export function scheduleForegroundClipboardImport({
  tryImport,
  retryDelays = FOREGROUND_CLIPBOARD_RETRY_DELAYS,
  setTimeoutImpl = globalThis.setTimeout?.bind(globalThis),
  clearTimeoutImpl = globalThis.clearTimeout?.bind(globalThis),
}) {
  let isCanceled = false;
  let timerId = null;

  async function runAttempt(index) {
    if (isCanceled) return;

    const imported = await tryImport();
    if (isCanceled || imported || index >= retryDelays.length) return;

    timerId = setTimeoutImpl(() => {
      void runAttempt(index + 1);
    }, retryDelays[index]);
  }

  void runAttempt(0);

  return () => {
    isCanceled = true;

    if (timerId !== null) {
      clearTimeoutImpl(timerId);
      timerId = null;
    }
  };
}
