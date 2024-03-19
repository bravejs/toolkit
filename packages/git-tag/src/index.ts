import childProcess from 'node:child_process';

let { level } = getArgs();

if (level !== 0 && level !== 1 && level !== 2) {
  level = 2;
}

function getArgs () {
  const list = process.argv.slice(2);
  const obj: Record<string, string | number | boolean> = {};
  const rexKey = /^--.+/;
  const rexNum = /-?(\d|\.)+/;

  for (let index = 0; index < list.length; index++) {
    const item = list[index];

    if (rexKey.test(item)) {
      const [k, v] = item.split('=');
      const value = v || list[index + 1];

      obj[k.substring(2)] = value
        ? rexNum.test(value)
          ? +value
          : rexKey.test(value)
            ? true
            : value
        : true;
    }
  }

  return obj;
}

function git (command: string): string {
  const result: Buffer & { stderr?: any } = childProcess.execSync(`git ${command}`, {
    cwd: process.cwd()
  });

  if (result.stderr) {
    throw result.stderr;
  }

  return result.toString();
}

function getNewTag (): number[] {
  const rex = /^v(\d|\.)*?\d$/;

  // 获取 tag 列表
  const list = git('tag -l')
    // 删除前后空格、换行符
    .trim()

    // 通过换行符分割
    .split('\n')

    // 筛选出版本号的 tag
    .filter((item) => rex.test(item))

    // 分割版本号为数字
    .map((item) => item.substring(1).split('.').map(Number))

    // 从高到低排序，只需要排 3 位
    .sort((a, b) => {
      const [a0 = 0, a1 = 0, a2 = 0] = a;
      const [b0 = 0, b1 = 0, b2 = 0] = b;

      return a0 === b0 ? (a1 === b1 ? b2 - a2 : b1 - a1) : b0 - a0;
    });

  // 获取当前最新的版本号
  let last = list[0];

  if (!last || last[0] < 1) {
    // 如果没有打过 tag，或者最新版本小于 1，就初始化为 1.0.0
    last = [1, 0, 0];
  } else {
    // 当版本号小于 3 位数，后面补 0
    while (last.length < 3) {
      last.push(0);
    }

    // 限制版本号不能超过 3 位数
    if (last.length > 3) {
      last.length = 3;
    }

    // 目标层级递增 1 作为新的 tag
    last[level as number] += 1;
  }

  return last;
}

function logError (message: string) {
  // eslint-disable-next-line no-console
  console.log('❌ 操作失败，' + message);
}

function start (branches?: string[]) {
  if (branches && branches.indexOf(git('branch --show-current').trim()) < 0) {
    return logError(`请在 ${branches.join(', ')} 分支操作`);
  }

  if (git('diff').trim()) {
    return logError('请将所有改动提交或者撤销再尝试');
  }

  git('pull');

  const tagName = `v${getNewTag().join('.')}`;

  git('push');

  try {
    git(`tag ${tagName}`);
    git('push --tags');
  } catch (e) {
    git(`tag -d ${tagName}`);
  }
}

export default start;
