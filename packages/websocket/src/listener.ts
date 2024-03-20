type Func = (...args: any[]) => any;

/**
 * 查找对应方法在集合中的位置
 */
function findIndex(fns: Func[], target: Func) {
  for (let index = 0; index < fns.length; index++) {
    const fn = fns[index];

    if (fn === target || (fn as any).__target__ === target) {
      return index;
    }
  }

  return -1;
}

/**
 * 创建代理方法，作用是执行一次后自动移除
 * `__target__` 属性指向目标方法，用于查找时正确匹配
 */
function createProxy(target: Func, callback: (proxy: Func) => void) {
  function proxy() {
    // eslint-disable-next-line prefer-rest-params
    target(...arguments);
    callback(proxy);
  }

  proxy.__target__ = target;

  return proxy;
}

class Listener {
  private _fns: { [K: string]: Func[] | undefined } = {};
  length = 0; // 所有类型的监听器数量

  add(type: string | number, fn: Func, once?: boolean) {
    let fns = this._fns[type];

    if (fns) {
      // 避免添加重复的方法
      if (findIndex(fns, fn) >= 0) {
        return;
      }
    } else {
      fns = [];
      this._fns[type] = fns;
    }

    fns.push(
      once
        ? createProxy(fn, (proxy) => {
            this.remove(type, proxy);
          })
        : fn
    );

    this.length += 1;
  }

  remove(type: string | number, fn?: Func) {
    const fns = this._fns[type];

    if (!fns) {
      return;
    }

    if (fn) {
      const index = findIndex(fns, fn);

      if (index >= 0) {
        fns.splice(index, 1);
        this.length -= 1;
      }
    } else {
      this.length -= fns.length;
    }

    // 删除全部方法
    if (!fn || fns.length === 0) {
      delete this._fns[type];
    }
  }

  get(type: string | number) {
    const fns = this._fns[type];

    // 需要返回浅复制的 fns，避免外部操作数组或者代理函数自动移除时导致异常
    return fns ? [...fns] : [];
  }
}

export default Listener;
