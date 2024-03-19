import { Pointer } from './types.js';
import { clearTimeout } from 'timers';

export class PressModel {
  private _timer: any = null;

  start (pointers: Pointer[]) {
    if (this._timer) {
      clearTimeout(this._timer);
    }

    this._timer = setTimeout(() => {
      this.press();
    }, 1000);
  }

  press () {
    //
  }

  end (pointers: Pointer[]) {
    clearTimeout(this._timer);
  }
}