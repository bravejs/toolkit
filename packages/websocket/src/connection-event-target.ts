export type DispatchSLCAction = 1 | -1

export interface SLCChangeEvent extends CustomEvent<{
  action: DispatchSLCAction
  slc: number
}> {}

export interface ConnectionEventMap<Data> extends WebSocketEventMap {
  data: MessageEvent<Data>
  slcchange: SLCChangeEvent
}

export interface ConnectionListener<K extends keyof ConnectionEventMap<Data>, Data> {
  (evt: ConnectionEventMap<Data>[K]): void

  __proxy?: ConnectionListener<K, Data>
}

export class ConnectionEventTarget<Data> {
  protected _eventMap: { [K: string]: Set<ConnectionListener<any, any>> } = {};

  slc = 0; // Subscription Listeners Count

  on<K extends keyof ConnectionEventMap<Data>> (type: K, listener: ConnectionListener<K, Data>) {
    const fns = this._eventMap[type];

    if (fns) {
      fns.add(listener);
    } else {
      this._eventMap[type] = new Set([listener]);
    }

    return this;
  }

  off<K extends keyof ConnectionEventMap<Data>> (type: K, listener?: ConnectionListener<K, Data>) {
    const fns = this._eventMap[type];

    if (fns) {
      if (listener) {
        fns.delete(listener.__proxy || listener);
      }

      if (!listener || fns.size === 0) {
        delete this._eventMap[type];
      }
    }
    
    return this;
  }

  once<K extends keyof ConnectionEventMap<Data>> (type: K, listener: ConnectionListener<K, Data>) {
    const proxy: ConnectionListener<K, Data> = (evt) => {
      listener(evt);
      this.off(type, proxy);
      delete listener.__proxy;
    };

    listener.__proxy = proxy;
    this.on(type, proxy);

    return this;
  }

  dispatchEvent (evt: Event): void {
    const fns = this._eventMap[evt.type];

    if (fns) {
      for (const fn of fns) {
        fn(evt);
      }
    }
  }

  dispatchSLC (action: DispatchSLCAction) {
    this.dispatchEvent(new CustomEvent('slcchange', {
      detail: {
        action: action,
        slc: this.slc += action,
      },
    }) as SLCChangeEvent);
  }
}