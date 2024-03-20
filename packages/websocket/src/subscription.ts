import {
  Subscriber,
  SubscriptionCallbacks,
  SubscriptionOptions,
} from './types';

class Subscription<Params, Data> {
  private _options: SubscriptionOptions<Params>;
  private _callbacks: SubscriptionCallbacks;
  private _subscribers: Subscriber<Params>[] = [];

  constructor(
    options: SubscriptionOptions<Params>,
    callbacks: SubscriptionCallbacks
  ) {
    this._options = options;
    this._callbacks = callbacks;
  }

  /**
   * 获取订阅参数
   * 来自所有订阅者的参数合并结果
   * 可能存在相同参数的订阅者，去重逻辑需要在配置层手动处理，因为数据合并逻辑千变万化，无法统一处理
   */
  get params(): Readonly<Params> {
    return this._options.mergeParams(
      this._subscribers.map((item) => {
        return item.params;
      })
    );
  }

  subscribe(params: Params, handler: (data: Data) => void): Subscriber<Params> {
    const { _options, _subscribers, _callbacks } = this;

    const subscriber: Subscriber<Params> = {
      params,

      update: (params) => {
        if (cancelled) {
          return;
        }

        update('remove'); // 移除旧参数，触发 `update:remove`
        subscriber.params = params;
        update('add'); // 加入新参数，触发 `update:add`
      },

      cancel: () => {
        if (cancelled) {
          return;
        }

        cancelled = true;
        _subscribers.splice(_subscribers.indexOf(subscriber), 1);

        if (_subscribers.length === 0) {
          // 已取消全部订阅，触发 `unsubscribe`
          _options.unsubscribe(subscriber.params);
        } else {
          // 仍然存在其他订阅，触发 `update:remove`
          update('remove');
        }

        _callbacks.remove(handler);
      },
    };

    const update = (type: 'add' | 'remove') => {
      _options.update(type, subscriber.params, this.params);
    };

    // 标记当前实例是否已经取消
    // 主要作用是防止外部重复调用 update 或者 cancel 方法
    let cancelled = false;

    /**
     * start
     */
    _callbacks.add(handler);
    _subscribers.push(subscriber);

    if (_subscribers.length === 1) {
      // 首次订阅，触发 `subscribe`
      _options.subscribe(subscriber.params);
    } else {
      // 非首次订阅，触发 `update:add`
      update('add');
    }

    return subscriber;
  }
}

export default Subscription;
