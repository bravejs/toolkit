import {
  onBeforeUnmount,
  onMounted,
  Ref,
  watch,
} from 'vue';

import { Subscriber, Subscription } from '../subscription';

export function toVueHook<P, D> (subscription: Subscription<any, P, D>) {
  return (params: Ref<P>, listener: (res: D) => void) => {
    let subscriber: Subscriber<P> | undefined;
    
    onMounted(() => {
      subscriber = subscription.subscribe(params.value, listener);
      watch(params, subscriber.update, { deep: true });
    });

    onBeforeUnmount(() => {
      subscriber!.cancel();
    });
  };
}
