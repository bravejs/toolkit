export type Formats = keyof typeof GETTERS
export type Replacer = (format: Formats, value: string, date: Date) => string

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const GETTERS = {
  YY: (d: Date) => GETTERS.YYYY(d).slice(2, 4), // 18 Two-digit year
  YYYY: (d: Date) => padZero(d.getFullYear(), 4), // 2018 Four-digit year

  M: (d: Date) => d.getMonth() + 1, // 1-12	The month, beginning at 1
  MM: (d: Date) => padZero(GETTERS.M(d), 2), // 01-12	The month, 2-digits
  MMM: (d: Date) => GETTERS.MMMM(d).slice(0, 3), // Jan-Dec	The abbreviated month name
  MMMM: (d: Date) => MONTHS[d.getMonth()], // January-December	The full month name

  D: (d: Date) => d.getDate(), // 1-31	The day of the month
  DD: (d: Date) => padZero(GETTERS.D(d), 2), // 01-31	The day of the month, 2-digits

  d: (d: Date) => d.getDay(), // 0-6	The day of the week, with Sunday as 0
  dd: (d: Date) => GETTERS.dddd(d).slice(0, 2), // Su-Sa	The min name of the day of the week
  ddd: (d: Date) => GETTERS.dddd(d).slice(0, 3), // Sun-Sat	The short name of the day of the week
  dddd: (d: Date) => WEEKDAYS[GETTERS.d(d)], // Sunday-Saturday	The name of the day of the week

  H: (d: Date) => d.getHours(), // 0-23	The hour
  HH: (d: Date) => padZero(GETTERS.H(d), 2), // 00-23	The hour, 2-digits

  h: (d: Date) => GETTERS.H(d) % 12, // 1-12	The hour, 12-hour clock
  hh: (d: Date) => padZero(GETTERS.h(d), 2), // 01-12	The hour, 12-hour clock, 2-digits

  m: (d: Date) => d.getMinutes(), // 0-59	The minute
  mm: (d: Date) => padZero(GETTERS.m(d), 2), // 00-59	The minute, 2-digits

  s: (d: Date) => d.getSeconds(), // 0-59	The second
  ss: (d: Date) => padZero(GETTERS.s(d), 2), // 00-59	The second, 2-digits

  S: (d: Date) => d.getMilliseconds(), // 0-999	The millisecond
  SSS: (d: Date) => padZero(GETTERS.S(d), 3), // 000-999	The millisecond, 3-digits

  z: (d: Date) => d.getTimezoneOffset() / -60, // +5 The offset from UTC
  Z: (d: Date) => formatZ(GETTERS.z(d)).join(':'), // +08:00 The offset from UTC, ±HH:mm
  ZZ: (d: Date) => formatZ(GETTERS.z(d)).join(''), // +0800	The offset from UTC, ±HHmm

  A: (d: Date) => GETTERS.a(d).toUpperCase(), // AM PM
  a: (d: Date) => GETTERS.H(d) < 12 ? 'am' : 'pm', // am pm

  Q: (d: Date) => Math.ceil(GETTERS.M(d) / 3), // Quarter

  x: (d: Date) => d.getTime(), // Unix Timestamp in millisecond
  X: (d: Date) => (GETTERS.x(d) / 1000) | 0, // Unix Timestamp in second
};

const FORMATS = Object.keys(GETTERS).sort((a, b) => b.length - a.length);

// Matching patterns wrapped with `[]` symbols will be preserved
const PATTERN = new RegExp(`\\[[^\\[\\]]+\\]|${FORMATS.join('|')}`, 'g');

function padZero (value: number | string, length: number) {
  let str = value.toString();

  while (str.length < length) {
    str = '0' + str;
  }

  return str;
}

function formatZ (z: number) {
  const [h, m] = Math.abs(z).toString().split('.');
  return [`${z < 0 ? '-' : '+'}` + padZero(h, 2), padZero((+m || 0) * 6, 2)];
}

function formatDate (date: Date | string | number, template: string, replacer?: Replacer) {
  const DATE = new Date(date);

  return template.replace(PATTERN, (m) => {
    if (m[0] === '[') {
      return m.slice(1, m.length - 1);
    }

    const value = GETTERS[m as Formats](DATE) + '';
    return replacer ? replacer(m as Formats, value, DATE) : value;
  });
}

export default formatDate;