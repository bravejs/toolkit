/**
 * PromiseRef 是一个基于 Promise 的 React 组件封装方式，旨在简化处理组件异步输入和输出的场景。
 */

import { type JSX, useState } from 'react';

type Render<Props, Value> = (
  props: Props,
  resolve: (value: Value) => void,
  reject: (reason?: any) => void
) => JSX.Element

type Slot = (() => JSX.Element | null) & {
  displayName?: string
}

/**
 * 创建空渲染插槽组件（初始值）
 */
function createEmptySlot (): Slot {
  return () => null;
}

/**
 * Promise Reference
 */
export class PromiseRef<Props extends object, Value> {

  /**
   * 更新 Slot 插槽组件的方法。默认无操作，它会在 `.use()` Hook 调用时被重写
   * @private
   */
  private _setSlot: (slot: () => Slot) => void = () => {};

  /**
   * 组件渲染器
   * @private
   */
  private readonly _render: Render<Props, Value>;

  /**
   * 组件渲染插槽。这是一个组件，可放在 tsx 中你想放的任意位置
   */
  Slot = createEmptySlot();

  constructor (render: Render<Props, Value>) {
    this._render = render;
  }

  /**
   * 克隆出一个全新的独立的引用
   */
  clone () {
    return new PromiseRef<Props, Value>(this._render);
  }
  
  /**
   * 初始化引用。这是一个 Hook，必须在 组件的顶层 调用
   */
  use () {
    const [slot, setSlot] = useState<Slot>(createEmptySlot);

    // 给插槽组件设置名称，以便在 react 开发工具中排查问题
    slot.displayName = this._render.name || 'PromiseRef.Slot';

    this.Slot = slot;
    this._setSlot = setSlot;
  }

  /**
   * 调用组件（将在插槽指定的位置渲染）
   * 这会返回一个 promise，可以非常灵活的控制功能逻辑
   * @param props
   */
  render (props?: Props) {
    const promise = new Promise<Value>((resolve, reject) => {
      this._setSlot(() => () => this._render(props || <any>{}, resolve, reject));
    });

    // 完成后销毁组件
    promise.finally(() => {
      this._setSlot(createEmptySlot);
    });

    return promise;
  }
}
