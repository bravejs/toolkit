import { useEffect } from 'react';
import { Subscription } from '../subscription';

export function toReactHook<P, D>(subscription: Subscription<any, P, D>) {
  return (params: P, listener: (res: D) => void) => {
    useEffect(
      () => subscription.subscribe(params, listener).cancel,
      [params && typeof params === 'object' ? JSON.stringify(params) : params],
    );
  };
}
