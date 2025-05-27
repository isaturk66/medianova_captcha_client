import base from './vite.config.ts';
export default {
  ...base,
  build: {
    ...base.build,
    lib: {
      entry: 'src/entry-i18n.ts',
      name: 'altcha-i18n',
      formats: ['es'],
      fileName: () => 'altcha.i18n.js',
    },
  },
};
