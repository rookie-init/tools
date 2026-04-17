import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('dev server configuration', () => {
  it('defines a dedicated https dev script', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

    expect(packageJson.scripts['dev:https']).toBe('vite --mode https');
    expect(packageJson.scripts['preview:https']).toBe('vite preview --mode https');
  });

  it('enables mkcert-backed https in vite config for dev and preview', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain("import mkcert from 'vite-plugin-mkcert';");
    expect(viteConfig).toContain("savePath: '.vite-plugin-mkcert'");
    expect(viteConfig).toContain("mkcert({ savePath: '.vite-plugin-mkcert' })");
    expect(viteConfig).toContain('preview: {');
    expect(viteConfig).toContain("https: mode === 'https',");
  });
});
