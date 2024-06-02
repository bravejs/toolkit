import { MergedParams } from './subscription';

export const IN_BROWSER = typeof window !== 'undefined';

export function shared<T>(name: string, creator: () => T): T {
  const root: any = IN_BROWSER ? window : {};

  name = `__WEB_SOCKET_CACHED_${name}__`;

  return root[name] || (root[name] = creator());
}

export function mergeArray<T>(
  current: T[],
  target: T[],
  check?: (current: T[], targetItem: T) => boolean,
): MergedParams<T[]> {
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

export function nextTick(handler: () => void) {
  let timerId: number | NodeJS.Timeout;

  return () => {
    clearTimeout(timerId);
    timerId = setTimeout(handler, 0);
  };
}
