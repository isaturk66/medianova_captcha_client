import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import fs from 'fs';

function externalAltcha(): Plugin {
  const externals = new Set([
    '/bundles/altcha.js',
    '/bundles/altcha.i18n.js',
  ]);
  return {
    name: 'external-altcha',
    resolveId(id) {
      if (externals.has(id)) return { id, external: true };
    },
  };
}

function copyHtmlToRoot(): Plugin {
  return {
    name: 'copy-html-to-root',
    buildStart() {
      const pages = [
        {
          src: 'src/pages/1/1.html',
          dest: '1.html',
          script: './1.ts',
          correctedScript: './src/pages/1/1.ts',
        },
        {
          src: 'src/pages/failure/failure.html',
          dest: 'failure.html',
          script: './failure.ts',
          correctedScript: './src/pages/failure/failure.ts',
        },
      ];

      for (const { src, dest, script, correctedScript } of pages) {
        const srcPath = resolve(__dirname, src);
        const destPath = resolve(__dirname, dest);
        let html = fs.readFileSync(srcPath, 'utf-8');
        html = html.replace(script, correctedScript);
        fs.writeFileSync(destPath, html, 'utf-8');
      }
    },

    closeBundle() {
      const tempFiles = ['1.html', 'failure.html'];
      for (const file of tempFiles) {
        fs.unlinkSync(resolve(__dirname, file));
      }
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    externalAltcha(),
    copyHtmlToRoot(),
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: false,

    rollupOptions: {
      input: {
        '1': resolve(__dirname, '1.html'),
        'failure': resolve(__dirname, 'failure.html'),
      },
      output: {
        entryFileNames: 'bundles/[name].js',
        chunkFileNames: 'bundles/[name].js',
        assetFileNames: 'bundles/[name][extname]',
      },
    },

    cssCodeSplit: true,
  },
});
