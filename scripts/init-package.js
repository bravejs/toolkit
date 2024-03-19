import fs from 'node:fs';
import path from 'node:path';
import { isNodeOnly, packages, readPackageConfig } from './utils.js';
import buildConfig from './build-config.js';

const licenceTemplate = fs.readFileSync(path.resolve('./LICENSE')).toString();

/**
 * @param {string} name
 * @param {string} [desc]
 * @returns {any}
 */
function getDefaultPackageConfig (name, desc) {
  const outDir = buildConfig.outDir;

  return {
    name: `@bravejs/${name}`,
    version: '0.0.0',
    description: desc || '',
    type: 'module',
    main: `./${outDir}/${name + buildConfig.ext.cjs}`,
    module: `./${outDir}/${name + buildConfig.ext.esm}`,
    unpkg: `./${outDir}/${name + buildConfig.ext.iifeMin}`, // browser only
    jsdelivr: `./${outDir}/${name + buildConfig.ext.iifeMin}`, // browser only
    types: `./${outDir}/${name + buildConfig.ext.dts}`,
    files: [outDir],
    author: 'shixianqin',
    license: 'MIT'
  };
}

/**
 * @param {import('fs').Dirent} dirent
 */
function initLicense (dirent) {
  const filePath = path.join(dirent.path, dirent.name, 'LICENSE');

  if (!fs.existsSync(filePath)) {
    fs.writeFile(filePath, licenceTemplate, () => true);
  }
}

/**
 * @param {import('fs').Dirent} dirent
 */
function initPackageConfig (dirent) {
  const filePath = path.join(dirent.path, dirent.name, 'package.json');
  const config = getDefaultPackageConfig(dirent.name);

  if (fs.existsSync(filePath)) {
    const originConfig = readPackageConfig(filePath);

    if (isNodeOnly(originConfig)) {
      // Node env only, Delete cdn config
      delete config.unpkg;
      delete config.jsdelivr;
    }

    const fixedConfig = { ...config };

    // delete some config that will change
    delete fixedConfig.version;
    delete fixedConfig.description;
    delete fixedConfig.files;
    delete fixedConfig.author;

    Object.assign(config, originConfig, fixedConfig);
  }

  fs.writeFile(filePath, JSON.stringify(config, null, 2), () => true);
}

/**
 * @param {import('fs').Dirent} dirent
 */
function initReadme (dirent) {
  const filePath = path.join(dirent.path, dirent.name, 'README.md');

  if (!fs.existsSync(filePath)) {
    fs.writeFile(filePath, `# ${dirent.name}\n`, () => true);
  }
}

/**
 * @param {import('fs').Dirent} dirent
 */
function initIndexFile (dirent) {
  const srcPath = path.join(dirent.path, dirent.name, 'src');
  const filePath = path.join(srcPath, 'index.ts');

  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath);
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFile(filePath, `export default {}\n`, () => true);
  }
}

/**
 * @param {import('fs').Dirent} dirent
 */
function initTestFile (dirent) {
  const srcPath = path.join(dirent.path, dirent.name, '__tests__');

  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath);
  }
}

// start
packages.forEach((item) => {
  initPackageConfig(item);
  initLicense(item);
  initReadme(item);
  initIndexFile(item);
  initTestFile(item);
});