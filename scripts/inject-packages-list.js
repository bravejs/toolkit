import fs from 'node:fs';
import path from 'node:path';
import { allPackages, readPackageConfig } from './utils.js';

const injectMarks = ['<!--inject-start-->', '<!--inject-end-->'];
const injectPattern = new RegExp(injectMarks.join('(.|\\n)*?'), 'gim');
const readmeFilePath = path.resolve('README.md');

const pkgs = allPackages.map((item) => {
  const config = readPackageConfig(path.join(item.path, item.name));
  const v = config.version;

  let status = '🔴'; // 🔴🟡🟢

  if (+v[0] > 0) {
    status = '🟢';
  } else if (v !== '0.0.0') {
    status = '🟡';
  }

  return {
    name: item.name,
    status,
    version: v,
    desc: config.description
  };
});

function injectPackagesList () {
  let tableTemplate = ''
    + '<table>'
    + '<thead>'
    + '<tr>'
    + '<th>Name</th>'
    + '<th>Description</th>'
    + '<th>Alpha</th>'
    + '<th>Beta</th>'
    + '<th>Stable</th>'
    + '</tr>'
    + '</thead>'
    + '<tbody>';

  for (const pkg of pkgs) {
    const v = pkg.version.split('.').map(Number);
    let isAlpha = v[0] + v[1] + v[2] > 0;
    let isBeta = v[0] + v[1] > 0;
    let isStable = v[0] > 0;

    tableTemplate += ''
      + '<tr>'
      + '<td nowrap>'
      + `<a href="./packages/${pkg.name}"><b>${pkg.name}</b></a>`
      + '</td>'
      + `<td>${pkg.desc}</td>`
      + `<td align="center">${isAlpha ? `✅` : '❌'}</td>`
      + `<td align="center">${isBeta ? '✅' : isAlpha ? '🟡' : '❌'}</td>`
      + `<td align="center">${isStable ? '✅' : isBeta ? '🟡' : '❌'}</td>`
      + '</tr>';
  }

  tableTemplate += '</tbody></table>';

  const readmeContent = fs.readFileSync(readmeFilePath).
    toString().replace(injectPattern, () => {
      return `${injectMarks[0]}\n${tableTemplate}\n${injectMarks[1]}`;
    });

  fs.writeFileSync(readmeFilePath, readmeContent);

  console.log('✅ Packages list injected!');
}

injectPackagesList();