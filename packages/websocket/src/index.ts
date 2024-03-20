import Listener from './listener.js';
import Subscription from './subscription.js';
import {
  Options,
  Subscriber,
  SubscriptionHooks,
  SubscriptionOptions,
  Subscriptions,
  WEM
} from './types';

export type {
  Options,
  Subscriber,
  Subscription,
  SubscriptionHooks,
  SubscriptionOptions
};

/**
 * 创建延迟器
 * @param callback
 * @param timeout
 */
function delay(callback: () => void, timeout?: number) {
  function set() {
    clear();
    tid = setTimeout(callback, timeout || 5000);
  }

  function clear() {
    clearTimeout(tid);
  }

  let tid: any = null;

  return { set, clear };
}

/**
 * 将数据转换为字符串
 * @param data
 */
function toString(data: any) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}

/**
 * 尝试将数据转换为 json
 * @param data
 */
function tryToJSON(data: any) {
  try {
    return JSON.parse(data);
  } catch (e) {
    // ignore
  }

  return data;
}

/**
 * Constructor
 */
class WS<ParamsBase, Response> {
  private readonly _options: Options<ParamsBase, Response>;
  private _ws: WebSocket | null = null;
  private _wsListener = new Listener();
  private _subListener = new Listener();
  private _subscriptions: Subscriptions = {};
  private _token = null;

  /**
   * ♥️，心跳
   * @private
   */
  private _ping = delay(() => {
    if (this._isReady()) {
      this._ws!.send(toString(this._options.ping || 'ping'));
    }
  }, 30000);

  /**
   * 延迟自动重启
   * @private
   */
  private _reconnect = delay(() => {
    this._connect();
  });

  /**
   * 延迟自动关闭（正常关闭）
   * @private
   */
  private _close = delay(() => {
    this.close();
  });

  constructor(options: Options<ParamsBase, Response>) {
    this._options = options;
  }

  on<K extends keyof WEM>(type: K, listener: (evt: WEM[K]) => void) {
    this._wsListener.add(type, listener);
  }

  once<K extends keyof WEM>(type: K, listener: (evt: WEM[K]) => void) {
    this._wsListener.add(type, listener, true);
  }

  off<K extends keyof WEM>(type: K, listener: (evt: WEM[K]) => void) {
    this._wsListener.remove(type, listener);
  }

  /**
   * 设置连接的唯一标记
   * @param token：token/session/userid
   */
  setToken(token: any) {
    if (token === this._token) {
      return;
    }

    this._token = token;

    if (this._isConnecting()) {
      // 当 token 变化时，需要重启连接，确保所有数据状态正确
      this.once('close', this._connect.bind(this));
      this.close();
    } else {
      // 尝试启动连接
      this._connect();
    }
  }

  /**
   * 关闭连接，一般情况下，取消全部订阅后自动执行
   */
  close() {
    // 无论如何，先取消所有延迟器
    this._ping.clear();
    this._reconnect.clear();
    this._close.clear();
    // 关闭
    this._ws?.close();
  }

  /**
   * 定义订阅模型
   * @param id
   * @param define
   */
  defineSubscription<Params = ParamsBase, Data extends Response = Response>(
    id: string | number,
    define: (send: (params: ParamsBase) => void) => SubscriptionOptions<Params>
  ): Subscription<Params, Data> {
    const { _subListener, _subscriptions } = this;

    // 重复订阅，直接返回原来的实例对象
    if (_subscriptions[id]) {
      return _subscriptions[id].instance;
    }

    // 获取订阅模型配置
    const options = define(this._send.bind(this));

    const instance = new Subscription<Params, Data>(options, {
      add: (handler) => {
        // 添加订阅事件监听器
        _subListener.add(id, handler);

        // 如果监听器的数量为 1，则表示为首次订阅，触发自动启动连接
        if (_subListener.length === 1) {
          this._connect();
        }
      },

      remove: (handler) => {
        // 移除订阅事件监听器
        _subListener.remove(id, handler);

        // 如果监听器的数量为 0，则表示已取消全部的订阅，触发自动关闭连接
        if (_subListener.length === 0) {
          this._close.set();
        }
      }
    });

    // 存储订阅模型
    _subscriptions[id] = {
      options,
      instance
    };

    return instance;
  }

  /**
   * 是否正在连接中
   * @private
   */
  private _isConnecting() {
    const state = this._ws?.readyState;

    return state === 0 || state === 1;
  }

  /**
   * 是否已经连接成功
   * @private
   */
  private _isReady() {
    return this._ws?.readyState === 1;
  }

  /**
   * 自动启动连接
   * @private
   */
  private _connect() {
    // 无论如何，先取消自动关闭
    this._close.clear();

    if (this._isConnecting()) {
      return; // 正在连接中，退出
    }

    if (this._subListener.length === 0) {
      return; // 没有订阅者，退出
    }

    if (this._options.withToken && !this._token) {
      return; // 配置了需要携带 token，但是目前还没有设置，退出
    }

    this._createWS();
  }

  /**
   * 创建 ws 实例
   * @private
   */
  private _createWS() {
    const { binaryType, url, protocols } = this._options;

    // 创建连接实例
    const ws = new WebSocket(
      typeof url === 'function' ? url() : url,
      protocols
    );

    this._ws = ws;
    ws.binaryType = binaryType || 'blob';
    ws.onopen = this._onopen.bind(this);
    ws.onmessage = this._onmessage.bind(this);
    ws.onerror = this._onerror.bind(this);
    ws.onclose = this._onclose.bind(this);
  }

  /**
   * 发送参数
   * @param params
   * @private
   */
  private _send(params: ParamsBase) {
    if (this._isReady()) {
      const { transformParams } = this._options;

      this._ws!.send(
        toString(
          transformParams ? transformParams(params, this._token) : params
        )
      );
    }
  }

  /**
   * 触发 websocket 事件
   * @param evt
   * @private
   */
  private _dispatchWS(evt: Event) {
    for (const fn of this._wsListener.get(evt.type)) {
      fn(evt);
    }
  }

  /**
   * 触发订阅事件
   * @param type
   * @param data
   * @private
   */
  private _dispatchSub(type: any, data: any) {
    for (const fn of this._subListener.get(type)) {
      fn(data);
    }
  }

  private _onopen(evt: Event) {
    this._dispatchWS(evt);

    const { _subscriptions, _subListener } = this;

    // 连接成功后，立即发送当前已激活的订阅信号
    for (const key in _subscriptions) {
      // 存在订阅者即为已激活
      if (_subListener.get(key).length > 0) {
        const { options, instance } = _subscriptions[key];

        options.subscribe(instance.params);
      }
    }

    this._ping.set(); // 初始 ping
  }

  private _onmessage(evt: MessageEvent) {
    this._dispatchWS(evt);
    this._ping.set(); // 持续 ping

    // 解析数据
    const { recognize, transformMessage } = this._options;
    let data = tryToJSON(evt.data);

    if (transformMessage) {
      data = transformMessage(data);
    }

    const type = recognize(data);

    // 通过识别的事件类型来触发对应的订阅监听器
    if (type) {
      if (Array.isArray(type)) {
        for (const typeElement of type) {
          this._dispatchSub(typeElement, data);
        }
      } else {
        this._dispatchSub(type, data);
      }
    }
  }

  private _onerror(evt: Event) {
    this._dispatchWS(evt);
  }

  private _onclose(evt: CloseEvent) {
    this._dispatchWS(evt);

    if (evt.code === 1000) {
      return; // 正常关闭
    }

    // 非正常关闭，触发自动重启
    this._reconnect.set();
  }
}

export default WS;
