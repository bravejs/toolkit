const chineseNumber = require('../dist/index');

describe('Normal', () => {
  test('1：一', () => {
    expect(chineseNumber(1)).toBe('一');
  });

  test('123：一百二十三', () => {
    expect(chineseNumber(123)).toBe('一百二十三');
  });

  test('1608.32：一千六百〇八点三二', () => {
    expect(chineseNumber(1608.32)).toBe('一千六百〇八点三二');
  });

  test('50805609：五千〇八十万五千六百〇九', () => {
    expect(chineseNumber(50805609)).toBe('五千〇八十万五千六百〇九');
  });

  test('100000000：一亿', () => {
    expect(chineseNumber(100000000)).toBe('一亿');
  });

  test('10000000000000000：一亿亿', () => {
    expect(chineseNumber(10000000000000000)).toBe('一亿亿');
  });
});

describe('Currency', () => {
  test('1：壹元整', () => {
    expect(chineseNumber(1, true)).toBe('壹元整');
  });

  test('123：壹佰贰拾叁元整', () => {
    expect(chineseNumber(123, true)).toBe('壹佰贰拾叁元整');
  });

  test('290.68：贰佰玖拾元零陆角捌分', () => {
    expect(chineseNumber(290.68, true)).toBe('贰佰玖拾元零陆角捌分');
  });

  test('1608.32：壹仟陆佰零捌元叁角贰分', () => {
    expect(chineseNumber(1608.32, true)).toBe('壹仟陆佰零捌元叁角贰分');
  });

  test('100000000：壹亿元整', () => {
    expect(chineseNumber(100000000, true)).toBe('壹亿元整');
  });

  test('10000000000000000：壹亿亿元整', () => {
    expect(chineseNumber(10000000000000000, true)).toBe('壹亿亿元整');
  });
});
