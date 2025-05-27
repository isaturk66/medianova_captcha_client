/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, basename } from 'node:path';

/* ─────────────────────────────────────────────────────────────────────
   1.  Tell Vite/Rollup that the two Altcha bundles are external URLs
       so it never tries to resolve them during HTML transform.
   ────────────────────────────────────────────────────────────────────*/
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


function flattenHtml(): Plugin {
  return {
    name: 'flatten-html',
    generateBundle(_, bundle) {
      for (const [fileName, file] of Object.entries(bundle)) {
        if (
          file.type === 'asset' &&
          fileName.endsWith('.html') &&
          fileName.startsWith('src/')
        ) {
          const flatName = basename(fileName);   // 1.html  /  failure.html
          bundle[flatName] = { ...file, fileName: flatName };
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),               // normal Vue compile
    externalAltcha(),
    flattenHtml(),
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: false,          // keep widget bundles copied earlier

    rollupOptions: {
      /* Your two HTML entry points (now at src root) */
      input: {
        '1':       resolve(__dirname, 'src/pages/1/1.html'),
        'failure': resolve(__dirname, 'src/pages/failure/failure.html'),
      },

      output: {
        /* All runtime files live here */
        entryFileNames:  'bundles/[name].js',
        chunkFileNames:  'bundles/[name].js',
        assetFileNames:  'bundles/[name][extname]',

        /* Disable code splitting so no extra helper chunks */
        manualChunks: undefined,
      },
    },

    /* Leave CSS splitting ON — Vite 6 writes one style.css per page import. */
    cssCodeSplit: true,
  },
});
