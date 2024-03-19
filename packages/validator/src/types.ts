export interface Rule<T = any> {
  required: boolean;
  number: boolean;
  digits: boolean;
  dateISO: boolean;
  url: boolean;
  email: boolean;
  min: number;
  max: number;
  minLength: number;
  maxLength: number;
  step: number;
  equal: any;
  notEqual: any;
  pattern: RegExp;
  validator: (value: T) => boolean | Promise<boolean>;
}

export interface RuleConfig<T> extends Partial<Rule<T>> {
  message:
    | string
    | (<K extends keyof Rule>(rule: K, param: Rule[K], value: T) => string);
}

export type Rules<T extends object> = {
  [K in keyof T]: RuleConfig<T[K]> | RuleConfig<T[K]>[]
}

export interface ValidationError<T extends object> {
  field: keyof T;
  value: any;
  rule: keyof Rule;
  param: any;
  message: string;
}

export interface Invalid<T extends object> {
  valid: false;
  errors: ValidationError<T>[];
}

export interface Valid<T extends object> {
  valid: true;
  data: T;
}

export type Validators = {
  [K in keyof Rule]: (param: Rule[K], value: any) => boolean | Promise<boolean>;
}