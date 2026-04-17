import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('GitHub Pages configuration', () => {
  it('uses /tools/ as the production base while keeping local development at root', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain("base: mode === 'production' ? '/tools/' : '/',");
  });
});
