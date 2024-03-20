import Subscription from './subscription';

export type WEM = WebSocketEventMap;

export interface SubscriptionHooks<P> {
  // 订阅钩子
  subscribe: (params: P) => any;

  // 取消订阅钩子
  unsubscribe: (params: P) => any;

  // 订阅参数更新钩子
  update: (type: 'add' | 'remove', target: P, params: P) => any;
}

export interface SubscriptionOptions<P> extends SubscriptionHooks<P> {
  // 参数合并方法
  mergeParams: (list: P[]) => P;
}

export interface SubscriptionCallbacks {
  add: (handler: (data: any) => any) => void;
  remove: (handler: (data: any) => any) => void;
}

export interface Subscriber<P> {
  // 订阅者的当前参数
  params: P;

  // 订阅者更新参数方法
  update: (params: P) => void;

  // 订阅者取消订阅方法
  cancel: () => void;
}

export interface Options<Params, Message> {
  // url
  url: string | (() => string);

  // 订阅事件识别器
  recognize: (
    data: Message
  ) => void | null | number | string | (string | number)[];

  // 转换发送数据
  transformParams?: (params: Params, token: any) => Params;

  // 转换响应数据
  transformMessage?: (message: any) => Message;

  // ping 参数
  ping?: number | string | object;

  // 标记连接将依赖唯一标识符（token，session，userid 等等）
  withToken?: boolean;

  binaryType?: BinaryType;
  protocols?: string | string[];
}

export interface Subscriptions {
  [K: string]: {
    options: SubscriptionOptions<any>;
    instance: Subscription<any, any>;
  };
}
