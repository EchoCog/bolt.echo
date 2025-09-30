import { describe, expect, test } from 'vitest';

import type { FileMap } from '~/lib/stores/files';
import { buildFileList } from '~/components/workbench/FileTree';

describe('buildFileList', () => {
  test('includes nested folders when root is hidden', () => {
    const files: FileMap = {
      '/src': { type: 'folder' },
      '/src/components': { type: 'folder' },
      '/src/components/Button.tsx': { type: 'file', content: '', isBinary: false },
      '/src/components/deep': { type: 'folder' },
      '/src/components/deep/nested': { type: 'folder' },
      '/src/components/deep/nested/Echo.tsx': { type: 'file', content: '', isBinary: false },
    };

    const list = buildFileList(files, '/src', true, []);

    expect(list.map(({ fullPath }) => fullPath)).toEqual([
      '/src/components',
      '/src/components/deep',
      '/src/components/deep/nested',
      '/src/components/deep/nested/Echo.tsx',
      '/src/components/Button.tsx',
    ]);
  });

  test('returns top-level folders when hiding the root slash', () => {
    const files: FileMap = {
      '/': { type: 'folder' },
      '/app': { type: 'folder' },
      '/app/index.ts': { type: 'file', content: '', isBinary: false },
    };

    const list = buildFileList(files, '/', true, []);

    expect(list.map(({ fullPath }) => fullPath)).toEqual(['/app', '/app/index.ts']);
  });
});
