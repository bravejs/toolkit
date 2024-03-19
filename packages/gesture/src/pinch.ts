import { Pointer } from './types.js';
import { getDistance } from './utils.js';
import { ModelBase } from './base.js';

export class PinchModel implements ModelBase {
  distance = 0;
  changedDistance = 0;
  scale = 1;

  private _baseScale = 1;

  start (pointers: Pointer[]) {
    this.distance = getDistance(pointers);
    this._baseScale = this.scale;
  }

  move (pointers: Pointer[]) {
    this.changedDistance = getDistance(pointers);
    this.scale = this.changedDistance / this.distance * this._baseScale;
  }

  end (pointers: Pointer[]) {
    //
  }
}
