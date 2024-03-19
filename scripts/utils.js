import fs from 'node:fs';
import path from 'node:path';
import buildConfig from './build-config.js';

const { includePackages, excludePackages } = buildConfig;

/**
 * @type {import('fs').Dirent[]}
 */
export const allPackages = fs.readdirSync(
  path.resolve('packages'),
  { withFileTypes: true }
).filter((item)=>{
  return !(item.name.startsWith('.') || !item.isDirectory());
});

/**
 * @type {import('fs').Dirent[]}
 */
export const packages = allPackages.
  filter((item) => {
    const name = item.name;

    if (includePackages.length > 0 && includePackages.indexOf(name) < 0) {
      return false;
    }

    if (excludePackages.indexOf(name) >= 0) {
      return false;
    }

    return true;
  });

/**
 * @param {string} name
 */
export function pascalName (name) {
  return name.replace(/(^|\W)\w/g, (m) => {
    return (m.length > 1 ? m[1] : m).toUpperCase();
  });
}

/**
 * @param {string} dir
 * @returns {any}
 */
export function readPackageConfig (dir) {
  if (dir.indexOf('package.json') < 0) {
    dir = path.join(dir, 'package.json');
  }

  return JSON.parse(fs.readFileSync(dir).toString());
}

/**
 * @param {any} pkg
 * @returns {boolean}
 */
export function isNodeOnly (pkg) {
  return !!(pkg.engines && pkg.engines.node);
}
