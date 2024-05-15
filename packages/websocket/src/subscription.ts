import { Connection } from './connection';

export interface MergedParams<T> {
  current: T
  changed: T
}

export interface SplitParams<T> {
  current: T | null
  changed: T
}

export interface SubscriptionOptions<T, P, D extends T> {
  recognize: (data: T) => boolean // 识别

  subscribe?: (params: MergedParams<P>, start?: boolean) => void
  unsubscribe?: (params: SplitParams<P>, end?: boolean) => void

  mergeParams?: (current: P, target: P) => MergedParams<P>; // 参数组合
  splitParams?: (current: P, target: P) => SplitParams<P>; // 参数分离

  filterByParams?: (params: P, data: D) => D | null; // 根据参数过滤数据
}

export interface Subscriber<P> {
  update: (params: P) => void;
  cancel: () => void;
}

export class Subscription<T, P, D extends T> {
  private _connection: Connection<D>;
  private _options: SubscriptionOptions<T, P, D>;
  private _params: P | null = null;
  private _listeners = new Set<(data: D) => void>();

  private _ondata = (evt: MessageEvent<D>) => {
    if (this._options.recognize(evt.data)) {
      for (const listener of this._listeners) {
        listener(evt.data);
      }
    }
  };

  constructor (connection: Connection<any>, options: SubscriptionOptions<T, P, D>) {
    this._connection = connection;
    this._options = options;
  }

  renew () {
    const { _params, _options: { subscribe } } = this;

    if (_params && subscribe && this._listeners.size > 0 && this._connection.ready) {
      subscribe({
        current: _params,
        changed: _params,
      }, true);
    }
  }

  subscribe (params: P, listener: (data: D) => void): Subscriber<P> {
    const { _connection, _options, _listeners, _ondata } = this;
    const { filterByParams } = _options;

    let changedParams: P = params;

    if (filterByParams) {
      const _listener = listener;

      listener = (data) => {
        const _data = filterByParams(changedParams, data);

        if (_data !== null) {
          _listener(_data);
        }
      };
    }

    const subscribe = (start?: boolean) => {
      let params: MergedParams<P>;

      if (this._params && _options.mergeParams) {
        params = _options.mergeParams(this._params, changedParams);
      } else {
        params = { current: changedParams, changed: changedParams };
      }

      this._params = params.current;

      if (start) {
        _connection.on('data', _ondata);
      }

      if (_connection.ready && _options.subscribe) {
        _options.subscribe(params, start);
      }
    };

    const unsubscribe = (end?: boolean) => {
      let params: SplitParams<P>;

      if (this._params && _options.splitParams) {
        params = _options.splitParams(this._params, changedParams);
      } else {
        params = { current: null, changed: changedParams };
      }

      this._params = params.current;

      if (end) {
        _connection.off('data', _ondata);
      }

      if (_connection.ready && _options.unsubscribe) {
        _options.unsubscribe(params, end);
      }
    };

    _listeners.add(listener);
    _connection.dispatchSLC(1);

    subscribe(_listeners.size === 1);

    return {
      update: (params: P) => {
        if (_listeners.has(listener)) {
          subscribe();
          changedParams = params;
          subscribe();
        }
      },

      cancel: () => {
        if (_listeners.has(listener)) {
          _listeners.delete(listener);
          _connection.dispatchSLC(-1);

          unsubscribe(_listeners.size === 0);
        }
      },
    };
  }
}