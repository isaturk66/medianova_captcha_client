/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';
import { minify } from 'csso';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'minify-raw-css',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.css?raw') || id.endsWith('.css&raw')) {
          const filePath = id.split('?')[0];
          const fileContents = readFileSync(filePath, 'utf-8');
          const minified = minify(fileContents).css;
          return `export default ${JSON.stringify(minified)}`;
        }
      },
    },
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    emptyOutDir: false,
    target: 'modules',
    lib: {
      entry: 'src/entry-i18n.ts',
      name: 'altcha-i18n',
      formats: ['es'],
      fileName: (format) => `altcha.i18n${format === 'es' ? '' : `.${format}`}.js`,
    },
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
    },
  },
  define: {
    ALTCHA_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
});