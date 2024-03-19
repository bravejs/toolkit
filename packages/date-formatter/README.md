# date-formatter
Date formatter, for example: YYYY-MM-DD hh:mm:ss

## Interface
```ts
declare const formatters: {
    YYYY: (d: Date) => string;
    YY: (d: Date) => string;
    M: (d: Date) => number;
    MM: (d: Date) => string;
    D: (d: Date) => number;
    DD: (d: Date) => string;
    H: (d: Date) => number;
    HH: (d: Date) => string;
    h: (d: Date) => number;
    hh: (d: Date) => string;
    m: (d: Date) => number;
    mm: (d: Date) => string;
    s: (d: Date) => number;
    ss: (d: Date) => string;
    ms: (d: Date) => number;
    MS: (d: Date) => string;
    w: (d: Date) => number;
    z: (d: Date) => number;
};

declare type Formats = keyof typeof formatters;

declare type Replacer = (type: Formats, value: string, date: Date) => string;

declare function dateFormatter(date: Date | string | number, template: string, replacer?: Replacer): string;
```
