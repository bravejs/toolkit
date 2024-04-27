interface Options {
  digits?: number, // 保留的小数位长度
  maxDigits?: number, // 最大保留的小数位长度，不显示末尾 0
  forceSign?: boolean, // 强制显示数字的正负号
  prefixSymbol?: string // 前缀符号，一般用于金额，如：$100
  suffixSymbol?: string // 后缀符号，一般用于金额，如：100$
  thousandsSymbol?: string // 千分符符号，一般是`,`，但是不同国家地区会有所不同
  dotSymbol?: string // 小数点符号，一般是`.`,但是不同国家地区会有所不同
  splitInterval?: number // 数字分隔间隔，一般是 3
  spaceSeparated?: boolean // 数字与符号直接插入空格
}

const defaultOptions: Options = {
  thousandsSymbol: ',',
  dotSymbol: '.',
  splitInterval: 3,
};

const abbreviations = {
  step: 3,
  units: ['', 'K', 'M', 'B', 'T'],
};

export function formatNumber (value: number, options?: Options) {
  const opts = { ...defaultOptions, ...options };
  let sign = opts.forceSign ? '+' : '';

  if (value < 0) {
    value = -value;
    sign = '-';
  }

  const [integer, decimal] = value.toString().split('.');
  let index = integer.length;
  let x = '';
  let c = 0;

  while (index-- > 0) {

    if (++c > 3) {
      c = 1;
      x = ',' + x;
    }

    x = integer[index] + x;
  }

  if (decimal) {
    x += '.' + decimal;
  }

  return sign + x;
}

console.log(formatNumber(1));
console.log(formatNumber(12));
console.log(formatNumber(123));
console.log(formatNumber(1234));
console.log(formatNumber(12345.2334));
console.log(formatNumber(123456));
console.log(formatNumber(1234567));
console.log(formatNumber(12345678));
console.log(formatNumber(-123456789));

const abbr1: [number, string][] = [[12, 'T'], [9, 'B'], [6, 'M'], [3, 'K']];

export function abbrNumber (value: number) {
  for (const [v, t] of abbr1) {
    const step = 10 ** v;

    if (Math.abs(value) >= step) {
      return value / step + t;
    }
  }

  return value;
}

console.log(abbrNumber(1));
console.log(abbrNumber(12));
console.log(abbrNumber(123));
console.log(abbrNumber(1234));
console.log(abbrNumber(12345.2334));
console.log(abbrNumber(123456));
console.log(abbrNumber(1234567));
console.log(abbrNumber(12345678));
console.log(abbrNumber(-1234956789));
