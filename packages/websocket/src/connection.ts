import { ConnectionEventTarget } from './connection-event-target';
import { Subscription, SubscriptionOptions } from './subscription';

export interface ConnectionOptions<D> {
  url: string;
  protocols?: string | string[];
  binaryType?: BinaryType;
  dataParser?: (data: any) => D | Promise<D>;
}

export interface PluginOptions<T = any> {
  name: string;
  install: (connection: Connection<any>, options?: T) => () => void;
}

export type DataType = Parameters<WebSocket['send']>[0];

export class Connection<T> extends ConnectionEventTarget<T> {
  private _options: ConnectionOptions<T>;
  private _ws: WebSocket | null = null;
  private _queue: DataType[] = [];
  private _plugins: Record<string, () => void> = {};
  private _subscriptions: Record<string, Subscription<T, any, any>> = {};
  private _lastDataSent: string = '';

  constructor(options: ConnectionOptions<T>) {
    super();
    this._options = options;
  }

  get readyState() {
    return this._ws?.readyState;
  }

  get ready() {
    return this.readyState === WebSocket.OPEN;
  }

  get active() {
    return this.ready || this.readyState === WebSocket.CONNECTING;
  }

  open() {
    if (this.active) {
      return;
    }

    const { _options } = this;
    const ws = new WebSocket(_options.url, _options.protocols);
    const dataParser = _options.dataParser || ((data: any): T => data);

    const dispatch = (evt: Event) => {
      this.dispatchEvent(evt);
    };

    const dispatchData = (data: T) => {
      dispatch(new MessageEvent('data', { data }));
    };

    ws.binaryType = _options.binaryType || 'blob';

    /**
     * onopen
     */
    ws.onopen = (evt) => {
      dispatch(evt);

      // Send all subscriptions params
      for (const subscription of Object.values(this._subscriptions)) {
        subscription.renew();
      }

      // Send all queue data
      for (const data of this._queue) {
        ws.send(data);
      }

      // And then clean it
      this._queue = [];
    };

    /**
     * onmessage
     */
    ws.onmessage = (evt) => {
      dispatch(evt);

      /**
       * ondata
       */
      const data = dataParser(evt.data);

      if (data instanceof Promise) {
        data.then(dispatchData);
      } else {
        dispatchData(data);
      }
    };

    /**
     * onerror
     */
    ws.onerror = dispatch;

    /**
     * onclose
     */
    ws.onclose = (evt) => {
      dispatch(evt);

      this._ws = null;
    };

    this._ws = ws;
  }

  nativeSend(data: DataType) {
    if (this.ready) {
      this._ws!.send(data);
    } else {
      this._queue.push(data);
    }
  }

  send(data: any, ignoreDuplicate?: boolean) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }

    if (ignoreDuplicate && data === this._lastDataSent) {
      return;
    }

    this._lastDataSent = data;

    this.nativeSend(data);
  }

  close(reason?: string) {
    if (this.active) {
      this._ws!.close(1000, reason); // CLOSE_NORMAL
    }
  }

  destroy() {
    for (const uninstall of Object.values(this._plugins)) {
      uninstall();
    }

    this.close();

    this._eventMap = null as any;
    this._options = null as any;
    this._plugins = null as any;
    this._subscriptions = null as any;
  }

  use<O extends object>(plugin: PluginOptions<O>, options?: O) {
    const { _plugins } = this;

    if (!_plugins[plugin.name]) {
      _plugins[plugin.name] = plugin.install(this, options);
    }

    return this;
  }

  unUse(plugin: PluginOptions) {
    const { _plugins } = this;
    const uninstall = _plugins[plugin.name];

    if (uninstall) {
      uninstall();
      delete _plugins[plugin.name];
    }

    return this;
  }

  defineSubscription<P, D extends T = T>(
    name: string,
    options: SubscriptionOptions<T, P, D>,
  ): Subscription<T, P, D> {
    const map = this._subscriptions;
    return map[name] || (map[name] = new Subscription<T, P, D>(this, options));
  }
}
