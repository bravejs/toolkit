class Transition<T extends object> {
  private _handler: (props: T) => void;

  constructor (handler: (props: T) => void) {
    this._handler = handler;
  }

  // 开始
  start (from: T, to: Partial<T>) {

  }

  // 暂停
  pause () {

  }

  // 继续
  continue () {

  }

  // 结束
  end () {

  }

  // 停止
  stop () {

  }

  // 重新开始
  restart () {

  }

  // 循环
  loop () {

  }
}
