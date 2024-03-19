import { Config, currencyConfig, defaultConfig } from './config';

/**
 * 分割整数，4 位一组
 */
function splitInteger (input: string, config: Config) {
  const chunks: string[] = [];
  let index = input.length % 4;

  function push (start: number, end: number) {
    chunks.push(
      parseIntegerCore(
        input.substring(start, end),
        config
      )
    );
  }

  // 截取最前面未满足 4 位的余块
  if (index > 0) {
    push(0, index);
  }

  // 截取 4 位一组的整块
  while (index < input.length) {
    push(index, index += 4);
  }

  return chunks;
}

/**
 * 解析整数核心（1～4 位）
 */
function parseIntegerCore (input: string, config: Config): string {
  const { numbers } = config;
  let result = '';

  for (let index = 0; index < input.length; index++) {
    const key = +input[index];

    // 如果数字不为 0，则拼接中文数字和单位
    if (key > 0) {
      result += numbers[key] + config.smallUnits[input.length - index - 1];
    }

    // 如果数字为 0，并且下一位数字不为 0 并且不是末位的情况下，拼接 `零`，否则忽略
    else if (+input[index + 1]) {
      result += numbers[0];
    }
  }

  // 如果输入是 `0000` 的情况下，返回结果为 `零`
  return result || numbers[0];
}

/**
 * 解析整数
 */
function parseInteger (input: string, config: Config) {
  const { numbers, bigUnits } = config;
  const chunks = splitInteger(input, config);
  let result = '';

  chunks.forEach((chunk, index) => {
    const chunkIndex = chunks.length - index - 1;
    // 规律：目前仅支持最大单位为`亿`
    // 亿:3 // 3=1,4=2,5=1,6=2,7=1,8=2,9=1,10=2
    // 兆:4 // 4=1,5=2,6=3,7=1,8=2,9=3,10=1,11=2,12=3
    const unitIndex = chunkIndex >= bigUnits.length ? chunkIndex % 2 ? 1 : 2 : chunkIndex;
    const unit = bigUnits[unitIndex];

    // 零块
    if (chunk === numbers[0]) {
      const nextChunk = chunks[index + 1];

      // 如果下一个块不是零开头，则拼接 `零`
      if (nextChunk && nextChunk[0] !== numbers[0]) {
        result += chunk;
      }

      // 否则，如果当前单位是最大单位，则保留单位
      else if (unitIndex === bigUnits.length - 1) {
        result += unit;
      }
    }

    // 非零块，直接拼接块和单位
    else {
      result += chunk + unit;
    }
  });

  return result;
}

/**
 * 解析小数
 */
function parseDecimal (value: string, config: Config) {
  const keys = value.toString().split('');
  let result = '';

  for (let index = 0; index < keys.length; index++) {
    result += config.numbers[+keys[index]] + (config.decimalUnits[index] || '');
  }

  return result;
}

/**
 * 阿拉伯数字 --> 中文数字
 */
function toString (value: number | string, currency?: boolean) {
  const config = currency ? currencyConfig : defaultConfig;
  const [integer, decimal] = value.toString().split('.');
  let result = parseInteger(integer, config);

  // 拼接小数点
  if (decimal) {
    result += config.dot;

    // 如果是金额数值，存在小数点并且整数的最后一位是 0 的情况下，需要加上`零`
    if (currency && integer[integer.length - 1] === '0' && decimal[0] !== '0') {
      result += config.numbers[0];
    }

    result += parseDecimal(decimal, config);
  }

  // 如果是金额数值，并且没有小数，则需要加上整数单位
  else if (currency) {
    result += config.integerUnit;
  }

  return result;
}

export default toString;