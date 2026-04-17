import './styles.css';
import { DEFAULT_STATE, normalizeStylePatch } from './lib/defaults.js';
import { readClipboardTextSafely } from './lib/clipboard.js';
import {
  createShellMarkup,
  formatSourceLabel,
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
  loadStoredState,
  pushHistoryItem,
  saveStoredState,
  toggleFavorite,
} from './lib/storage.js';

const app = document.querySelector('#app');
app.innerHTML = createShellMarkup();

const state = { ...DEFAULT_STATE, ...loadStoredState() };
const elements = getAppElements();
let isEditing = false;

function renderMemorySection() {
  elements.memory.innerHTML = renderMemory(state);
}

function renderSettingsSection() {
  elements.settings.innerHTML = renderSettings(state);
}

function updateSourceIndicator(source) {
  elements.sourceIndicator.textContent = formatSourceLabel(source);
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

async function applyValue(nextValue, source = null) {
  state.value = nextValue;
  Object.assign(state, pushHistoryItem(state, nextValue));
  elements.input.value = state.value;
  updateSourceIndicator(source);
  renderMemorySection();
  saveStoredState(state);
  await syncQr();
}

function bindSettingControls() {
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

async function tryClipboardImport(source) {
  if (!state.autoClipboard || isEditing) return;
  const nextValue = await readClipboardTextSafely();
  if (!nextValue || nextValue === state.value) return;
  await applyValue(nextValue, source);
}

elements.input.value = state.value;
renderSettingsSection();
renderMemorySection();
bindSettingControls();
updateSourceIndicator(null);

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
  updateSourceIndicator('Edited manually');
  await syncQr();
});

elements.clearButton.addEventListener('click', async () => {
  state.value = '';
  elements.input.value = '';
  saveStoredState(state);
  updateSourceIndicator('Cleared');
  await syncQr();
});

elements.pasteButton.addEventListener('click', async () => {
  const nextValue = await readClipboardTextSafely();
  if (nextValue) {
    await applyValue(nextValue, 'Pasted from clipboard');
  }
});

elements.favoriteButton.addEventListener('click', () => {
  Object.assign(state, toggleFavorite(state, state.value));
  renderMemorySection();
  saveStoredState(state);
});

elements.memory.addEventListener('click', async (event) => {
  const historyButton = event.target.closest('[data-history]');
  const favoriteButton = event.target.closest('[data-favorite]');

  if (historyButton) {
    await applyValue(historyButton.dataset.history, 'Loaded from recent history');
  }

  if (favoriteButton) {
    await applyValue(favoriteButton.dataset.favorite, 'Loaded from favorites');
  }
});

elements.saveButton.addEventListener('click', () => {
  exportCanvasAsPng(elements.canvas);
});

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    await tryClipboardImport('Updated from clipboard');
  }
});

const sharedValue = readSharedValueFromUrl();
if (sharedValue) {
  await applyValue(sharedValue, 'Imported from Android share sheet');
  clearSharedParams();
} else {
  await tryClipboardImport('Loaded from clipboard');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

await syncQr();
