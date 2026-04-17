import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('GitHub Pages configuration', () => {
  it('uses /tools/ as the production base while keeping local development at root', () => {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain("base: mode === 'production' ? '/tools/' : '/',");
  });

  it('defines a GitHub Pages deployment workflow for main', () => {
    const workflow = fs.readFileSync(
      path.join(projectRoot, '.github', 'workflows', 'deploy-pages.yml'),
      'utf8',
    );

    expect(workflow).toContain('name: Deploy to GitHub Pages');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('branches: [main]');
    expect(workflow).toContain('uses: actions/setup-node@v4');
    expect(workflow).toContain('run: npm ci');
    expect(workflow).toContain('run: npm run build');
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v3');
    expect(workflow).toContain('path: dist');
    expect(workflow).toContain('uses: actions/deploy-pages@v4');
  });
});
