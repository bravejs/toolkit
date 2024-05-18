import { Connection } from './connection';

export interface MergedParams<T> {
  current: T;
  changed: T;
}

export interface SplitParams<T> {
  current: T | null;
  changed: T;
}

export interface SubscriptionOptions<T, P, D extends T> {
  recognize: (data: T) => boolean;

  subscribe?: (params: MergedParams<P>, start?: boolean) => void;
  unsubscribe?: (params: SplitParams<P>, end?: boolean) => void;

  mergeParams?: (current: P, target: P) => MergedParams<P>;
  splitParams?: (current: P, target: P) => SplitParams<P>;

  filterByParams?: (params: P, data: D) => D | null;
}

export interface Subscriber<P> {
  params: P;
  update: (params: P) => void;
  cancel: () => void;
}

export interface SubscriberListener<D> {
  (data: D): void;

  __proxy?: SubscriberListener<D>;
}

export class Subscription<T, P, D extends T> {
  private _connection: Connection<D>;
  private _options: SubscriptionOptions<T, P, D>;
  private _params: P | null = null;
  private _subscribers = new Map<Subscriber<P>, SubscriberListener<D>>();

  private readonly _ondata = (evt: MessageEvent<D>) => {
    const { _options, _subscribers } = this;

    if (_options.recognize(evt.data)) {
      for (const [, listener] of _subscribers) {
        const fn = listener.__proxy || listener;
        fn(evt.data);
      }
    }
  };

  constructor (
    connection: Connection<any>,
    options: SubscriptionOptions<T, P, D>,
  ) {
    this._connection = connection;
    this._options = options;
  }

  renew () {
    const { _connection, _subscribers, _params, _options } = this;

    if (_options.subscribe && _subscribers.size > 0 && _connection.ready) {
      _options.subscribe(
        {
          current: _params!,
          changed: _params!,
        },
        true,
      );
    }
  }

  // 创建订阅者
  subscribe (params: P, listener: SubscriberListener<D>): Subscriber<P> {
    const { _connection, _subscribers, _options } = this;
    const { filterByParams } = _options;

    const subscriber: Subscriber<P> = {
      params,

      update: (params: P) => {
        if (_subscribers.has(subscriber)) {
          // 1. Unsubscribe from the old parameters
          this._unsubscribe(subscriber);

          // 2. Set the new parameters
          subscriber.params = params;

          // 3. Subscribe to new parameters
          this._subscribe(subscriber);
        }
      },

      cancel: () => {
        if (_subscribers.has(subscriber)) {
          _subscribers.delete(subscriber);
          _connection.dispatchSLC(-1);

          if (filterByParams) {
            delete listener.__proxy;
          }

          this._unsubscribe(subscriber, _subscribers.size === 0);
        }
      },
    };

    if (filterByParams) {
      listener.__proxy = (data) => {
        const _data = filterByParams.apply(_options, [subscriber.params, data]);

        if (_data !== null) {
          listener(_data);
        }
      };
    }

    _subscribers.set(subscriber, listener);
    _connection.dispatchSLC(1);

    this._subscribe(subscriber, _subscribers.size === 1);

    return subscriber;
  }

  private _subscribe (subscriber: Subscriber<P>, start?: boolean) {
    const { _connection, _options } = this;
    const current = this._getCurrentParams(subscriber);
    const changed = subscriber.params;
    let mergedParams: MergedParams<P>;

    if (current && _options.mergeParams) {
      mergedParams = _options.mergeParams(current, changed);
    } else {
      mergedParams = { current: changed, changed };
    }

    this._params = mergedParams.current;

    if (start) {
      _connection.on('data', this._ondata);
    }

    if (_options.subscribe && _connection.ready) {
      _options.subscribe(mergedParams, start);
    }
  }

  private _unsubscribe (subscriber: Subscriber<P>, end?: boolean) {
    const { _connection, _options } = this;
    const current = this._getCurrentParams(subscriber);
    const changed = subscriber.params;
    let splitParams: SplitParams<P>;

    if (current && _options.splitParams) {
      splitParams = _options.splitParams(current, changed);
    } else {
      splitParams = { current: null, changed };
    }

    this._params = splitParams.current;

    if (end) {
      _connection.off('data', this._ondata);
    }

    if (_options.unsubscribe && _connection.ready) {
      _options.unsubscribe(splitParams, end);
    }
  }

  private _getCurrentParams (subscriber: Subscriber<P>) {
    const { _subscribers, _options } = this;
    let currentParams: P | null = null;

    if (_options.mergeParams) {
      for (const [item] of _subscribers) {
        if (item !== subscriber) {
          currentParams = currentParams
            ? _options.mergeParams(currentParams, item.params).current
            : item.params;
        }
      }
    }

    return currentParams;
  }
}
