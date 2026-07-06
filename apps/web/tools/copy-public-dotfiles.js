import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDir = dirname(fileURLToPath(import.meta.url));
const webRoot = join(toolsDir, '..');
const repoRoot = join(webRoot, '..', '..');
const outputDir = join(repoRoot, 'dist', 'apps', 'web');
const dotfiles = ['.htaccess'];

mkdirSync(outputDir, { recursive: true });

for (const file of dotfiles) {
  const source = join(webRoot, 'public', file);
  const target = join(outputDir, file);
  if (existsSync(source)) {
    copyFileSync(source, target);
  }
}
