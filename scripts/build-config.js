export default {
  /**@type {string[]}*/
  includePackages: [
  ],

  /**@type {string[]}*/
  excludePackages: [
    'eslint-config',
  ],

  outDir: 'dist',
  ext: {
    cjs: '.cjs',
    esm: '.mjs',
    iife: '.global.js',
    iifeMin: '.global.min.js',
    dts: '.d.ts',
  },
  globals: {
    vue: 'Vue',
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
