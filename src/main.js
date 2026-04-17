import './styles.css';
import { registerSW } from 'virtual:pwa-register';
import { shouldAutoImportClipboard } from './lib/auto-clipboard.js';
import { DEFAULT_STATE, normalizeStylePatch } from './lib/defaults.js';
import {
  copyTextSafely,
  getPasteButtonLabel,
  readClipboardTextResult,
} from './lib/clipboard.js';
import {
  createClipboardSession,
  markAppClipboardWrite,
  notePossibleExternalClipboardChange,
  shouldTreatClipboardReadAsStale,
} from './lib/clipboard-session.js';
import { scheduleForegroundClipboardImport } from './lib/foreground-clipboard.js';
import {
  collectDebugInfo,
  formatDebugInfo,
  writeDebugInfoToInput,
} from './lib/debug-info.js';
import { getCopyPayload } from './lib/copy-action.js';
import {
  createShellMarkup,
  getAppElements,
  renderMemory,
  renderSettings,
} from './lib/dom.js';
import {
  exportCanvasAsPng,
  renderQrToCanvas,
  shouldWarnAboutScanability,
} from './lib/qr-code.js';
import { clearSharedParams, readSharedValueFromUrl } from './lib/share-target.js';
import {
  addFavoriteItem,
  loadStoredState,
  removeFavoriteItem,
  removeHistoryItem,
  pushHistoryItem,
  saveStoredState,
} from './lib/storage.js';
import { resolveStartupValue } from './lib/startup-value.js';

const app = document.querySelector('#app');
app.innerHTML = createShellMarkup();
registerSW({ immediate: true });

const state = {
  ...DEFAULT_STATE,
  ...loadStoredState(),
  value: '',
  isStyleExpanded: false,
};
const elements = getAppElements();
let isEditing = false;
let pasteButtonResetTimer = null;
const clipboardSession = createClipboardSession();
let cancelForegroundClipboardImport = null;

function renderMemorySection() {
  elements.memory.innerHTML = renderMemory(state);
}

function renderSettingsSection() {
  elements.settings.innerHTML = renderSettings(state);
  bindSettingControls();
  bindStyleToggle();
}

async function syncQr() {
  const nextValue = state.value.trim() || ' ';
  await renderQrToCanvas(elements.canvas, {
    value: nextValue,
    size: state.size,
    margin: state.margin,
    foreground: state.foreground,
    background: state.background,
    errorCorrectionLevel: state.errorCorrectionLevel,
  });

  const warning = shouldWarnAboutScanability(state);
  elements.warning.hidden = !warning;
  elements.warning.textContent = warning
    ? 'Low color contrast may make this code harder to scan.'
    : '';
}

async function applyValue(nextValue) {
  state.value = nextValue;
  Object.assign(state, pushHistoryItem(state, nextValue));
  elements.input.value = state.value;
  renderMemorySection();
  saveStoredState(state);
  await syncQr();
}

function buildDebugInfoText() {
  return formatDebugInfo(collectDebugInfo());
}

function bindSettingControls() {
  if (!state.isStyleExpanded) return;

  for (const [key, id] of [
    ['size', '#size-input'],
    ['margin', '#margin-input'],
    ['foreground', '#foreground-input'],
    ['background', '#background-input'],
    ['errorCorrectionLevel', '#error-level-input'],
  ]) {
    document.querySelector(id).addEventListener('input', async (event) => {
      Object.assign(state, normalizeStylePatch({ [key]: event.target.value }));
      saveStoredState(state);
      await syncQr();
    });
  }

  document.querySelector('#auto-clipboard-input').addEventListener('change', (event) => {
    state.autoClipboard = event.target.checked;
    saveStoredState(state);
  });
}

function bindStyleToggle() {
  document.querySelector('#style-toggle-button').addEventListener('click', () => {
    state.isStyleExpanded = !state.isStyleExpanded;
    renderSettingsSection();
  });
}

async function tryClipboardImport(trigger) {
  if (
    !shouldAutoImportClipboard({
      autoClipboard: state.autoClipboard,
      isEditing,
      trigger,
    })
  ) {
    return;
  }

  const result = resolveClipboardResult(await readClipboardTextResult());
  if (result.status !== 'success' || !result.text || result.text === state.value) return false;
  await applyValue(result.text);
  return true;
}

function resetPasteButtonLabel() {
  if (pasteButtonResetTimer) {
    window.clearTimeout(pasteButtonResetTimer);
    pasteButtonResetTimer = null;
  }

  elements.pasteButton.textContent = 'Paste';
}

function showPasteButtonFallback(status) {
  elements.input.focus();
  elements.pasteButton.textContent = getPasteButtonLabel(status);

  if (pasteButtonResetTimer) {
    window.clearTimeout(pasteButtonResetTimer);
  }

  pasteButtonResetTimer = window.setTimeout(() => {
    elements.pasteButton.textContent = 'Paste';
    pasteButtonResetTimer = null;
  }, 1800);
}

function resolveClipboardResult(result) {
  return shouldTreatClipboardReadAsStale(clipboardSession, result)
    ? { status: 'stale', text: null }
    : result;
}

function stopForegroundClipboardImport() {
  if (!cancelForegroundClipboardImport) return;

  cancelForegroundClipboardImport();
  cancelForegroundClipboardImport = null;
}

elements.input.value = state.value;
renderSettingsSection();
renderMemorySection();

elements.input.addEventListener('focus', () => {
  isEditing = true;
});

elements.input.addEventListener('blur', () => {
  isEditing = false;
  const nextState = pushHistoryItem(state, elements.input.value);
  Object.assign(state, nextState, { value: elements.input.value });
  renderMemorySection();
  saveStoredState(state);
});

elements.input.addEventListener('input', async (event) => {
  state.value = event.target.value;
  saveStoredState(state);
  await syncQr();
});

elements.clearButton.addEventListener('click', async () => {
  state.value = '';
  elements.input.value = '';
  saveStoredState(state);
  await syncQr();
});

elements.fillDebugButton.addEventListener('click', async () => {
  const debugInfo = writeDebugInfoToInput(elements.input, buildDebugInfoText());
  await applyValue(debugInfo);
});

elements.copyDebugButton.addEventListener('click', async () => {
  const text = getCopyPayload({
    inputValue: elements.input.value,
  });

  const copied = await copyTextSafely(text);

  if (copied) {
    markAppClipboardWrite(clipboardSession, text);
  }
});

elements.pasteButton.addEventListener('click', async () => {
  const result = resolveClipboardResult(await readClipboardTextResult());

  if (result.status === 'success') {
    resetPasteButtonLabel();
    await applyValue(result.text);
    return;
  }

  showPasteButtonFallback(result.status);
});

elements.favoriteButton.addEventListener('click', () => {
  Object.assign(state, addFavoriteItem(state, state.value));
  renderMemorySection();
  saveStoredState(state);
});

elements.memory.addEventListener('click', async (event) => {
  const deleteHistoryButton = event.target.closest('[data-delete-history]');
  const deleteFavoriteButton = event.target.closest('[data-delete-favorite]');
  const historyButton = event.target.closest('[data-history]');
  const favoriteButton = event.target.closest('[data-favorite]');

  if (deleteHistoryButton) {
    Object.assign(state, removeHistoryItem(state, deleteHistoryButton.dataset.deleteHistory));
    renderMemorySection();
    saveStoredState(state);
    return;
  }

  if (deleteFavoriteButton) {
    Object.assign(state, removeFavoriteItem(state, deleteFavoriteButton.dataset.deleteFavorite));
    renderMemorySection();
    saveStoredState(state);
    return;
  }

  if (historyButton) {
    await applyValue(historyButton.dataset.history);
  }

  if (favoriteButton) {
    await applyValue(favoriteButton.dataset.favorite);
  }
});

elements.saveButton.addEventListener('click', () => {
  exportCanvasAsPng(elements.canvas);
});

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') {
    stopForegroundClipboardImport();
    notePossibleExternalClipboardChange(clipboardSession);
    return;
  }

  if (document.visibilityState === 'visible' && state.autoClipboard) {
    stopForegroundClipboardImport();
    cancelForegroundClipboardImport = scheduleForegroundClipboardImport({
      tryImport: () => tryClipboardImport('foreground'),
    });
  }
});

const sharedValue = readSharedValueFromUrl();
if (sharedValue) {
  await applyValue(sharedValue);
  clearSharedParams();
} else {
  const imported = await tryClipboardImport('load');

  if (!imported) {
    const startupValue = resolveStartupValue({
      sharedValue: '',
      clipboardValue: '',
      history: state.history,
    });

    if (startupValue) {
      await applyValue(startupValue);
    }
  }
}

await syncQr();
