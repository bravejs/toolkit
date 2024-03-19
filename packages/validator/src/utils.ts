export function isFn (param: any): param is Function {
  return typeof param === 'function';
}

export function isObj<T = object> (value: any): value is T {
  return value && typeof value === 'object';
}

export function getLength (value: any): number {
  return (isObj<any>(value) ? value : String(value)).length || 0;
}