import { Connection } from './connection';

export interface MergedParams<T> {
  current: T;
  changed: T;
}

export interface SplitParams<T> {
  current: T | null;
  changed: T;
}

export interface ActionFlags {
  start?: boolean;
  update?: boolean;
  end?: boolean;
}

export interface SubscriptionOptions<T, P, D extends T> {
  recognize: (data: T) => boolean;

  subscribe?: (params: MergedParams<P>, flags: ActionFlags) => void;
  unsubscribe?: (params: SplitParams<P>, flags: ActionFlags) => void;

  mergeParams?: (current: P, target: P) => MergedParams<P>;
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

type MergedResult<P> = null | { current: P; final: MergedParams<P> };

export class Subscription<T, P, D extends T> {
  private _connection: Connection<D>;
  private _options: SubscriptionOptions<T, P, D>;
  private _params: P | null = null;
  private _subscribers = new Map<Subscriber<P>, SubscriberListener<D>>();

  private readonly _ondata = (evt: MessageEvent<D>) => {
    if (this._options.recognize(evt.data)) {
      for (const [, listener] of this._subscribers) {
        const fn = listener.__proxy || listener;
        fn(evt.data);
      }
    }
  };

  constructor(
    connection: Connection<any>,
    options: SubscriptionOptions<T, P, D>,
  ) {
    this._connection = connection;
    this._options = options;
  }

  renew() {
    const { _connection, _subscribers, _params, _options } = this;

    if (_options.subscribe && _subscribers.size > 0 && _connection.ready) {
      _options.subscribe(
        {
          current: _params!,
          changed: _params!,
        },
        { start: true },
      );
    }
  }

  // 创建订阅者
  subscribe(params: P, listener: SubscriberListener<D>): Subscriber<P> {
    const { _connection, _subscribers, _options } = this;
    const { filterByParams } = _options;

    const subscriber: Subscriber<P> = {
      params,

      update: (params: P) => {
        if (_subscribers.has(subscriber)) {
          // 1. Unsubscribe from the old parameters
          this._unsubscribe(subscriber, {
            update: true,
          });

          // 2. Set the new parameters
          subscriber.params = params;

          // 3. Subscribe to new parameters
          this._subscribe(subscriber, {
            update: true,
          });
        }
      },

      cancel: () => {
        if (_subscribers.has(subscriber)) {
          _subscribers.delete(subscriber);
          _connection.dispatchSubs(-1);

          if (filterByParams) {
            delete listener.__proxy;
          }

          this._unsubscribe(subscriber, {
            end: _subscribers.size === 0,
          });
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
    _connection.dispatchSubs(1);

    this._subscribe(subscriber, {
      start: _subscribers.size === 1,
    });

    return subscriber;
  }

  private _subscribe(subscriber: Subscriber<P>, flags: ActionFlags) {
    const { _connection, _options } = this;
    const result = this._mergeParams(subscriber);

    const mergedParams: MergedParams<P> = result
      ? result.final
      : {
          current: subscriber.params,
          changed: subscriber.params,
        };

    this._params = mergedParams.current;

    if (flags.start) {
      _connection.on('data', this._ondata);
    }

    if (_options.subscribe && _connection.ready) {
      _options.subscribe(mergedParams, flags);
    }
  }

  private _unsubscribe(subscriber: Subscriber<P>, flags: ActionFlags) {
    const { _connection, _options } = this;
    const result = this._mergeParams(subscriber);

    const splitParams: SplitParams<P> = result
      ? {
          current: result.current,
          changed: result.final.changed,
        }
      : {
          current: null,
          changed: subscriber.params,
        };

    this._params = splitParams.current;

    if (flags.end) {
      _connection.off('data', this._ondata);
    }

    if (_options.unsubscribe && _connection.ready) {
      _options.unsubscribe(splitParams, flags);
    }
  }

  private _mergeParams(subscriber: Subscriber<P>): MergedResult<P> {
    const { _subscribers, _options } = this;
    let current: P | null = null;

    if (_options.mergeParams) {
      for (const [item] of _subscribers) {
        if (item !== subscriber) {
          current = current
            ? _options.mergeParams(current, item.params).current
            : item.params;
        }
      }

      if (current) {
        return {
          current,
          final: _options.mergeParams(current, subscriber.params),
        };
      }
    }

    return null;
  }
}
