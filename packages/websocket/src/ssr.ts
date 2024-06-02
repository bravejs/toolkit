import { Subscriber, Subscription } from './subscription';

export const SSRSubscriber: Subscriber<any> = {
  start: () => {},
  update: () => {},
  cancel: () => {},
};

export const SSRSubscription: Subscription<any, any, any> = {
  subscribe: (): Subscriber<any> => SSRSubscriber,
  renew: () => {},
} as any;
