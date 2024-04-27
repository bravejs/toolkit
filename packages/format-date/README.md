# Format date
Date time formatter, like this: YYYY-MM-DD hh:mm:ss

## Interface
```ts
declare const GETTERS: {
  YY: (d: Date) => string;
  YYYY: (d: Date) => string;
  M: (d: Date) => number;
  MM: (d: Date) => string;
  MMM: (d: Date) => string;
  MMMM: (d: Date) => string;
  D: (d: Date) => number;
  DD: (d: Date) => string;
  d: (d: Date) => number;
  dd: (d: Date) => string;
  ddd: (d: Date) => string;
  dddd: (d: Date) => string;
  H: (d: Date) => number;
  HH: (d: Date) => string;
  h: (d: Date) => number;
  hh: (d: Date) => string;
  m: (d: Date) => number;
  mm: (d: Date) => string;
  s: (d: Date) => number;
  ss: (d: Date) => string;
  S: (d: Date) => number;
  SSS: (d: Date) => string;
  z: (d: Date) => number;
  Z: (d: Date) => string;
  ZZ: (d: Date) => string;
  A: (d: Date) => string;
  a: (d: Date) => "am" | "pm";
  Q: (d: Date) => number;
  x: (d: Date) => number;
  X: (d: Date) => number;
};

type Formats = keyof typeof GETTERS;

type Replacer = (format: Formats, value: string, date: Date) => string;

declare function formatDate(date: Date | string | number, template: string, replacer?: Replacer): string;

export { type Formats, type Replacer, formatDate as default };
```
