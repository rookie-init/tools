export function createShellMarkup() {
  return `
    <main class="app-shell">
      <section class="hero-panel" data-section="input">
        <div class="hero-copy">
          <p class="eyebrow">Offline QR Tool</p>
        </div>
        <label class="input-panel">
          <span class="label">Content</span>
          <textarea id="qr-input" rows="6" placeholder="Paste text, URL, or any string"></textarea>
        </label>
        <div class="action-row">
          <button id="paste-button" class="button button-primary" type="button">Paste and Generate</button>
          <button id="clear-button" class="button button-secondary" type="button">Clear</button>
        </div>
      </section>
      <section class="preview-panel" data-section="preview">
        <div class="qr-card">
          <canvas id="qr-canvas" width="320" height="320"></canvas>
        </div>
        <p id="source-indicator" class="micro-copy">Ready offline</p>
        <p id="scanability-warning" class="micro-copy warning" hidden></p>
        <div class="action-row action-row-stacked">
          <button id="save-button" class="button button-primary button-wide" type="button">Save PNG</button>
          <button id="favorite-button" class="button button-tertiary button-wide" type="button">Toggle Favorite</button>
        </div>
        <p class="micro-copy">If download is blocked on iPhone, long-press the QR card to save the image.</p>
      </section>
      <section class="settings-panel" data-section="controls"></section>
      <section class="memory-panel" data-section="memory"></section>
    </main>
  `;
}

export function getAppElements() {
  return {
    input: document.querySelector('#qr-input'),
    canvas: document.querySelector('#qr-canvas'),
    sourceIndicator: document.querySelector('#source-indicator'),
    warning: document.querySelector('#scanability-warning'),
    pasteButton: document.querySelector('#paste-button'),
    clearButton: document.querySelector('#clear-button'),
    saveButton: document.querySelector('#save-button'),
    favoriteButton: document.querySelector('#favorite-button'),
    settings: document.querySelector('.settings-panel'),
    memory: document.querySelector('.memory-panel'),
  };
}

export function renderSettings(state) {
  return `
    <div class="panel-header">
      <p class="eyebrow eyebrow-light">Style</p>
      <h2>Adjust the code without leaving the page.</h2>
    </div>
    <div class="control-grid">
      <label class="control">
        <span class="label-light">Size</span>
        <input id="size-input" type="range" min="160" max="640" step="16" value="${state.size}" />
      </label>
      <label class="control">
        <span class="label-light">Margin</span>
        <input id="margin-input" type="range" min="0" max="64" step="2" value="${state.margin}" />
      </label>
      <label class="control">
        <span class="label-light">Foreground</span>
        <input id="foreground-input" type="color" value="${state.foreground}" />
      </label>
      <label class="control">
        <span class="label-light">Background</span>
        <input id="background-input" type="color" value="${state.background}" />
      </label>
      <label class="control">
        <span class="label-light">Error Correction</span>
        <select id="error-level-input">
          <option value="L" ${state.errorCorrectionLevel === 'L' ? 'selected' : ''}>L</option>
          <option value="M" ${state.errorCorrectionLevel === 'M' ? 'selected' : ''}>M</option>
          <option value="Q" ${state.errorCorrectionLevel === 'Q' ? 'selected' : ''}>Q</option>
          <option value="H" ${state.errorCorrectionLevel === 'H' ? 'selected' : ''}>H</option>
        </select>
      </label>
      <label class="control control-toggle">
        <span class="label-light">Foreground Clipboard Refresh</span>
        <input id="auto-clipboard-input" type="checkbox" ${state.autoClipboard ? 'checked' : ''} />
      </label>
    </div>
  `;
}

export function renderMemory(state) {
  const historyItems = state.history
    .map((item) => `<button class="memory-chip" data-history="${item}">${item}</button>`)
    .join('');
  const favoriteItems = state.favorites
    .map((item) => `<button class="memory-chip favorite-chip" data-favorite="${item}">${item}</button>`)
    .join('');

  return `
    <div class="panel-header">
      <p class="eyebrow eyebrow-light">Memory</p>
      <h2>Keep the strings you use most.</h2>
    </div>
    <div class="memory-group">
      <p class="label-light">Favorites</p>
      <div class="chip-list">${favoriteItems || '<p class="empty-copy">No favorites yet.</p>'}</div>
    </div>
    <div class="memory-group">
      <p class="label-light">Recent</p>
      <div class="chip-list">${historyItems || '<p class="empty-copy">No recent items yet.</p>'}</div>
    </div>
  `;
}

export function formatSourceLabel(source) {
  return source || 'Ready offline';
}
