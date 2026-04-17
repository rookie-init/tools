import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('offline pwa configuration', () => {
  it('registers the service worker without waiting for the full window load event', () => {
    const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.js'), 'utf8');

    expect(main).toContain("navigator.serviceWorker.register('/sw.js')");
    expect(main).not.toContain("window.addEventListener('load'");
  });

  it('makes the service worker activate and claim pages immediately', () => {
    const sw = fs.readFileSync(path.join(projectRoot, 'public', 'sw.js'), 'utf8');

    expect(sw).toContain('self.skipWaiting()');
    expect(sw).toContain('self.clients.claim()');
  });

  it('uses resilient shell precaching instead of failing the whole install on one missing asset', () => {
    const sw = fs.readFileSync(path.join(projectRoot, 'public', 'sw.js'), 'utf8');

    expect(sw).not.toContain('cache.addAll(APP_SHELL)');
    expect(sw).toContain('Promise.allSettled');
  });

  it('falls back to cached shell for navigation requests when offline', () => {
    const sw = fs.readFileSync(path.join(projectRoot, 'public', 'sw.js'), 'utf8');

    expect(sw).toContain("event.request.mode === 'navigate'");
    expect(sw).toContain("cache.match('/')");
  });
});
