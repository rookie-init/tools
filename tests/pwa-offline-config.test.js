import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('offline pwa configuration', () => {
  it('registers the service worker through vite-plugin-pwa with immediate activation', () => {
    const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.js'), 'utf8');

    expect(main).toContain("import { registerSW } from 'virtual:pwa-register';");
    expect(main).toContain('registerSW({ immediate: true');
  });

  it('configures vite-plugin-pwa to generate the service worker and manifest from build output', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain("import { VitePWA } from 'vite-plugin-pwa';");
    expect(viteConfig).toContain('VitePWA({');
    expect(viteConfig).toContain("strategies: 'generateSW'");
    expect(viteConfig).toContain("registerType: 'autoUpdate'");
    expect(viteConfig).toContain('manifest: {');
  });

  it('aligns pwa start and share target urls with the github pages base path', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain('const base = mode ===');
    expect(viteConfig).toContain('start_url: base');
    expect(viteConfig).toContain('scope: base');
    expect(viteConfig).toContain('action: base');
  });

  it('removes the hand-written service worker and static manifest files', () => {
    const serviceWorkerPath = path.join(projectRoot, 'public', 'sw.js');
    const manifestPath = path.join(projectRoot, 'public', 'manifest.webmanifest');

    expect(fs.existsSync(serviceWorkerPath)).toBe(false);
    expect(fs.existsSync(manifestPath)).toBe(false);
  });
});
