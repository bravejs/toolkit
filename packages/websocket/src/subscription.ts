import { Connection } from './connection';
import { nextTick } from './utils';

export interface MergedParams<T> {
  current: T;
  changed: T;
}

export interface SplitParams<T> {
  current: T | null;
  changed: T;
}

export interface ActionFlags {
  isFirst?: boolean;
  isLast?: boolean;
}

export interface SubscriptionOptions<T, P, D extends T> {
  recognize: (data: T) => boolean;
  subscribe?: (params: MergedParams<P>, flags: ActionFlags) => void;
  unsubscribe?: (params: SplitParams<P>, flags: ActionFlags) => void;
  mergeParams?: (current: P, target: P) => MergedParams<P>;
  filterByParams?: (params: P, data: D) => D | null;
}

export interface Subscriber<P> {
  start: (params: P) => void;
  update: (params: P) => void;
  cancel: () => void;
}

export type SubscriberListener<D> = (data: D) => void;

interface SubscriberInner<P, D> extends Subscriber<P> {
  _params: P;
  _listener: SubscriberListener<D>;
}

export class Subscription<T, P, D extends T> {
  private _connection: Connection<D>;
  private _options: SubscriptionOptions<T, P, D>;
  private _subscribers = new Set<SubscriberInner<P, D>>();
  private _queueSubscribe = new Map<SubscriberInner<P, D>, P>();
  private _queueUnsubscribe = new Map<SubscriberInner<P, D>, P>();
  private _flags: ActionFlags = {};
  private _params: P | null = null;

  constructor(
    connection: Connection<any>,
    options: SubscriptionOptions<T, P, D>,
  ) {
    this._connection = connection;
    this._options = options;
  }

  private _ondata = (evt: MessageEvent<D>) => {
    const { _options, _subscribers } = this;
    const { data } = evt;

    if (_options.recognize(data)) {
      for (const item of _subscribers) {
        let _data: D | null = data;

        if (_options.filterByParams) {
          _data = _options.filterByParams(item._params, data);

          if (_data === null) {
            continue;
          }
        }

        item._listener(_data);
      }
    }
  };

  private _nextTickAction = nextTick(() => {
    this._action();
  });

  private _action() {
    const {
      _options,
      _connection,
      _subscribers,
      _queueUnsubscribe,
      _queueSubscribe,
      _flags,
    } = this;

    const merge = (current: P | null | undefined, target: P) => {
      if (current && _options.mergeParams) {
        return _options.mergeParams(current, target);
      }

      return {
        current: target,
        changed: target,
      };
    };

    let current: P | null = null;

    /**
     * merge current params
     */
    for (const subscriber of _subscribers) {
      if (
        _queueSubscribe.has(subscriber) ||
        _queueUnsubscribe.has(subscriber)
      ) {
        continue;
      }

      current = merge(current, subscriber._params).current;
    }

    /**
     * subscribe
     */
    if (_queueSubscribe.size > 0) {
      let subscribeParams: P | null = null;

      for (const [, itemParams] of _queueSubscribe) {
        subscribeParams = merge(subscribeParams, itemParams).current;
      }

      _queueSubscribe.clear();

      const mergedParams: MergedParams<P> = merge(current, subscribeParams!);

      current = mergedParams.current;

      if (_options.subscribe && _connection.ready) {
        _options.subscribe(mergedParams, _flags);
      }
    }

    /**
     * unsubscribe
     */
    if (_queueUnsubscribe.size > 0) {
      let unsubscribeParams: P | null = null;

      for (const [, itemParams] of _queueUnsubscribe) {
        unsubscribeParams = merge(unsubscribeParams, itemParams).current;
      }

      _queueUnsubscribe.clear();

      if (_options.unsubscribe && _connection.ready) {
        _options.unsubscribe(
          {
            current,
            changed: merge(current, unsubscribeParams!).changed,
          },
          _flags,
        );
      }
    }

    // clear flags
    if (_flags.isFirst || _flags.isLast) {
      this._flags = {};
    }

    // update params
    this._params = current;
  }

  subscribe(params: P, listener: SubscriberListener<D>): Subscriber<P> {
    const {
      _connection,
      _subscribers,
      _queueSubscribe,
      _queueUnsubscribe,
      _ondata,
      _nextTickAction,
    } = this;

    const subscriber: SubscriberInner<P, D> = {
      _params: params,
      _listener: listener,

      start: (params: P) => {
        if (!_subscribers.has(subscriber)) {
          _subscribers.add(subscriber);
          _queueSubscribe.set(subscriber, params);
          _connection._dispatchSubs(1);

          if (_subscribers.size === 1) {
            this._flags = { isFirst: true };
            _connection.on('data', this._ondata);
          }

          _nextTickAction();
        }
      },

      update: (params: P) => {
        if (_subscribers.has(subscriber)) {
          _queueUnsubscribe.set(subscriber, subscriber._params);
          _queueSubscribe.set(subscriber, (subscriber._params = params));

          _nextTickAction();
        }
      },

      cancel: () => {
        if (_subscribers.has(subscriber)) {
          _subscribers.delete(subscriber);
          _queueUnsubscribe.set(subscriber, subscriber._params);
          _connection._dispatchSubs(-1);

          if (_subscribers.size === 0) {
            this._flags = { isLast: true };
            _connection.off('data', _ondata);
          }

          _nextTickAction();
        }
      },
    };

    subscriber.start(params);

    return subscriber;
  }

  renew() {
    const { _connection, _subscribers, _params, _options } = this;

    if (_options.subscribe && _subscribers.size > 0 && _connection.ready) {
      _options.subscribe(
        {
          current: _params!,
          changed: _params!,
        },
        {
          isFirst: true,
        },
      );
    }
  }
}
