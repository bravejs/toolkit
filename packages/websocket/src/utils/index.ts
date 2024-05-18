import { MergedParams, SplitParams } from '../subscription';

export const IN_BROWSER = typeof window !== 'undefined';

export function cached<T> (key: string, creator: () => T): T {
  const root: any = IN_BROWSER ? window : {};
  key = `__WEB_SOCKET_CACHED_${key}__`;
  return root[key] || (root[key] = creator());
}

export function mergeArray<T> (current: T[], target: T[], check?: (current: T[], targetItem: T) => boolean): MergedParams<T[]> {
  const changed: T[] = [];

  current = [...current];

  for (const targetItem of target) {
    if (check ? check(current, targetItem) : current.indexOf(targetItem) < 0) {
      current.push(targetItem);
      changed.push(targetItem);
    }
  }

  return {
    current,
    changed,
  };
}

export function splitArray<T> (current: T[], target: T[], findIndex?: (current: T[], targetItem: T) => number): SplitParams<T[]> {
  const changed: T[] = [];

  current = [...current];

  for (const targetItem of target) {
    const index = findIndex ? findIndex(current, targetItem) : current.indexOf(targetItem);

    if (index >= 0) {
      current.splice(index, 1);
      changed.push(targetItem);
    }
  }

  return {
    current,
    changed,
  };
}
