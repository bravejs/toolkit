import { type JSX, useState } from 'react';

export interface PromiseRefProps<V> {
  resolve: (value: V) => void
  reject: (reason?: any) => void
}

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
 * promiseRef 是一个基于 Promise 的 React 组件封装方式，旨在简化处理组件异步输入和输出的场景。
 * @param render 渲染器（React 函数组件）
 */
export function usePromiseRef<P extends PromiseRefProps<any>> (render: (props: P) => JSX.Element) {
  const [slot, setSlot] = useState<Slot>(createEmptySlot);

  // 给插槽组件设置名称，以便在 react 开发工具中排查问题
  slot.displayName = render.name || 'PromiseRef.Slot';
  
  return {
    /**
     * 组件渲染插槽。这是一个组件，可放在 tsx 中你想放的任意位置
     */
    Slot: slot,

    /**
     * 调用组件（将在插槽指定的位置渲染）
     * 这会返回一个 promise，可以非常灵活的控制组件输入输出的流程
     * @param props
     */
    render: (props?: Omit<P, 'resolve' | 'reject'>) => {
      const promise = new Promise<Parameters<P['resolve']>[0]>((resolve, reject) => {
        setSlot(() => () => render({
          ...(props || <any>{}),
          resolve,
          reject,
        }));
      });

      // 完成后销毁组件
      promise.finally(() => {
        setSlot(createEmptySlot);
      });

      return promise;
    },
  };
}
