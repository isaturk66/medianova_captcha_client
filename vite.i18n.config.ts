/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import { basename, join } from 'node:path';
import { writeFileSync } from 'node:fs';

const input = process.argv[process.argv.length - 1];

function generateDTs(): Plugin {
  let name: string = '';
  let target: string = '';
  return {
    name: 'generate-d-ts',
    configResolved(config) {
      const lib = config.build.lib;
      if (lib && lib.entry) {
        name = basename(String(lib.entry)).replace('.ts', '');
        target = join(config.build.outDir, name + '.d.ts');
      }
	  },
    async writeBundle() {
      if (target) {
        writeFileSync(target, `declare module 'altcha/i18n/${name}';`);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    generateDTs(),
  ],
  build: {
    target: 'modules',
    outDir: 'dist_i18n',
    minify: 'esbuild',
    emptyOutDir: false,
    lib: {
      entry: input,
      fileName: '[name]',
      name: '[name]',
      formats: ['es'],
    },
    rollupOptions: {},
  },
  define: {
    ALTCHA_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
