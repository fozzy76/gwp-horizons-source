import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outputDir = join(root, '..', '..', 'dist', 'apps', 'web');
const dotfiles = ['.htaccess'];

mkdirSync(outputDir, { recursive: true });

for (const file of dotfiles) {
  const source = join(root, 'public', file);
  const target = join(outputDir, file);
  if (existsSync(source)) {
    copyFileSync(source, target);
  }
}
