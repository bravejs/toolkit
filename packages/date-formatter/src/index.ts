export type Keys = keyof typeof getters

export type Replacer = (key: Keys, value: string, date: Date) => string

const getters = {
  YYYY: (d: Date) => padZero(d.getFullYear(), 4), // YYYY: full year

  YY: (d: Date) => getters.YYYY(d).slice(-2), // YY: year (double digits)

  M: (d: Date) => d.getMonth() + 1, // M: month

  MM: (d: Date) => padZero(getters.M(d)), // MM: month (double digits)

  D: (d: Date) => d.getDate(), // D: date

  DD: (d: Date) => padZero(getters.D(d)), // DD: date (double digits)

  H: (d: Date) => d.getHours(), // H: hours（24 hour）

  HH: (d: Date) => padZero(getters.H(d)), // HH: hours（double digits, 24）

  h: (d: Date) => getters.H(d) % 12, // h: hours（12）

  hh: (d: Date) => padZero(getters.h(d)), // hh: hours（double digits，12）

  m: (d: Date) => d.getMinutes(), // m: minutes

  mm: (d: Date) => padZero(getters.m(d)), // mm: minutes (double digits)

  s: (d: Date) => d.getSeconds(), // s: seconds

  ss: (d: Date) => padZero(getters.s(d)), // ss: seconds (double digits)

  ms: (d: Date) => d.getMilliseconds(), // ms: milliseconds

  MS: (d: Date) => padZero(getters.ms(d), 3), // MS: milliseconds（three digits）

  w: (d: Date) => d.getDay(), // w: day

  z: (d: Date) => d.getTimezoneOffset() / -60 // z: timezone
};

// Matching patterns wrapped with `[]` symbols will be preserved
const pattern = /\[[^\][]+]|YYYY|YY|MM|DD|HH|hh|mm|ss|ms|MS|M|D|H|h|m|s|w|z/g;

function padZero (value: number, length = 2) {
  let str = value.toString();

  while (str.length < length) {
    str = '0' + str;
  }

  return str;
}

function dateFormatter (date: Date | string | number, template: string, replacer?: Replacer) {
  const _date = new Date(date);

  return template.replace(pattern, (m) => {
    if (m[0] === '[') {
      return m.substring(1, m.length - 1);
    }

    const value = getters[m as Keys](_date) + '';

    return replacer ? replacer(m as Keys, value, _date) : value;
  });
}

export default dateFormatter;