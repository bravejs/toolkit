export type DispatchSubsAction = 1 | -1;

export interface SubsChangeEvent
  extends CustomEvent<{
    action: DispatchSubsAction;
    subs: number;
  }> {}

export interface ConnectionEventMap<Data> extends WebSocketEventMap {
  data: MessageEvent<Data>;
  subschange: SubsChangeEvent;
}

export interface ConnectionListener<
  K extends keyof ConnectionEventMap<Data>,
  Data,
> {
  (evt: ConnectionEventMap<Data>[K]): void;

  __proxy?: ConnectionListener<K, Data>;
}

export class ConnectionEventTarget<Data> {
  protected _eventMap: { [K: string]: Set<ConnectionListener<any, any>> } = {};

  subs = 0; // Subscriptions Count

  on<K extends keyof ConnectionEventMap<Data>>(
    type: K,
    listener: ConnectionListener<K, Data>,
  ) {
    const fns = this._eventMap[type];

    if (fns) {
      fns.add(listener);
    } else {
      this._eventMap[type] = new Set([listener]);
    }

    return this;
  }

  off<K extends keyof ConnectionEventMap<Data>>(
    type: K,
    listener?: ConnectionListener<K, Data>,
  ) {
    const fns = this._eventMap[type];

    if (fns) {
      if (listener) {
        fns.delete(listener);
      }

      if (!listener || fns.size === 0) {
        delete this._eventMap[type];
      }
    }

    return this;
  }

  once<K extends keyof ConnectionEventMap<Data>>(
    type: K,
    listener: ConnectionListener<K, Data>,
  ) {
    listener.__proxy = (evt) => {
      listener(evt);
      this.off(type, listener);
      delete listener.__proxy;
    };

    this.on(type, listener);

    return this;
  }

  dispatchEvent(evt: Event): void {
    const fns = this._eventMap[evt.type];

    if (fns) {
      for (const fn of fns) {
        (fn.__proxy || fn)(evt);
      }
    }
  }

  dispatchSubs(action: DispatchSubsAction) {
    this.dispatchEvent(
      new CustomEvent('subschange', {
        detail: {
          action: action,
          subs: (this.subs += action),
        },
      }) as SubsChangeEvent,
    );
  }
}
