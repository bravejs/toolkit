import path from 'node:path';
import ts from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { deleteSync } from 'del';
import tsconfig from './tsconfig.json' assert { type: 'json' };
import {
  isNodeOnly,
  packages,
  pascalName,
  readPackageConfig
} from './scripts/utils.js';
import buildConfig from './scripts/build-config.js';

// inject packages list when build
import './scripts/inject-packages-list.js';

const tsPlugin = ts({
  compilerOptions: tsconfig.compilerOptions
});

const terserPlugin = terser();
const dtsPlugin = dts();

/**
 * @type {import('rollup').RollupOptions[]}
 */
const rollupOptions = [];

packages.forEach((item) => {
  const name = item.name;
  const pkgDir = path.join(item.path, name);
  const pkgConfig = readPackageConfig(pkgDir);
  const inputFile = `${pkgDir}/src/index.ts`;
  const outDir = `${pkgDir}/${buildConfig.outDir}`;

  // Delete output folder before build
  deleteSync([`${outDir}/*`]);

  /** @type {import('rollup').OutputOptions[]} */
  const outputOptions = [
    {
      format: 'cjs',
      file: `${outDir}/${name + buildConfig.ext.cjs}`
    },
    {
      format: 'es',
      file: `${outDir}/${name + buildConfig.ext.esm}`
    }
  ];

  // Not node env only, build for browser
  if (!isNodeOnly(pkgConfig)) {
    const libName = pascalName(name);

    outputOptions.push(
      {
        name: libName,
        globals: buildConfig.globals,
        format: 'iife',
        file: `${outDir}/${name + buildConfig.ext.iife}`
      },
      {
        name: libName,
        globals: buildConfig.globals,
        format: 'iife',
        file: `${outDir}/${name + buildConfig.ext.iifeMin}`,
        plugins: [terserPlugin]
      }
    );
  }

  rollupOptions.push(
    {
      input: inputFile,
      output: outputOptions,
      plugins: [tsPlugin]
    },
    {
      input: inputFile,
      output: {
        format: 'es',
        file: `${outDir}/${name + buildConfig.ext.dts}`
      },
      plugins: [dtsPlugin]
    }
  );
});

export default rollupOptions;