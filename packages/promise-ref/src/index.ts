import { type JSX, useState } from 'react';

/**
 * PromiseRef 组件的基础参数类型
 * @property resolve Promise 的 resolve 回调函数
 * @property reject Promise 的 reject 回调函数
 */
export interface PromiseRefProps<V> {
  resolve: (value: V) => void
  reject: (reason?: any) => void
}

/**
 * 渲染器类型
 */
type Render<P extends PromiseRefProps<any>> = (props: P) => JSX.Element

/**
 * 插槽组件类型
 * @property displayName 组件名
 */
type Slot = (() => JSX.Element | null) & {
  displayName?: string
}

/**
 * 排除 PromiseRefProps 的类型
 */
type P<Props extends object> = Omit<Props, keyof PromiseRefProps<any>>

/**
 * 创建空渲染插槽组件（初始值）
 */
function createEmptySlot (): Slot {
  return () => null;
}

/**
 * PromiseRef 构造器
 */
export class PromiseRef<Props extends PromiseRefProps<any>> {
  private readonly _render: Render<Props>;
  private readonly _setSlot: (slot: () => Slot) => void;

  /**
   * 组件渲染插槽。这是一个组件，可放在 tsx 中你想放的任意位置
   */
  Slot: Slot;

  /**
   * @param render 渲染器（React 函数组件）
   */
  constructor (render: Render<Props>) {
    const [slot, setSlot] = useState<Slot>(createEmptySlot);

    // 设置组件名
    slot.displayName = render.name || 'PromiseRef.Slot';

    this._render = render;
    this._setSlot = setSlot;
    this.Slot = slot;
  }

  /**
   * 调用组件（将在插槽指定的位置渲染）
   * 这会返回一个 promise，可以非常灵活的控制组件异步输入输出的流程
   * @param props
   */
  render (props?: P<Props>) {
    const promise = new Promise<Parameters<Props['resolve']>[0]>((resolve, reject) => {
      this._setSlot(() => () => this._render({
        ...(props || <any>{}),
        resolve,
        reject,
      }));
    });

    // 完成后销毁组件
    promise.finally(() => {
      this._setSlot(createEmptySlot);
    });

    return promise;
  }
}
