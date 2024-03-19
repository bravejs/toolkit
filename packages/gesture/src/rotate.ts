import { Pointer } from './types.js';
import { getAngle } from './utils.js';
import { ModelBase } from './base.js';

export class RotateModel implements ModelBase {
  angle = 0;
  changedAngle = 0;
  rotation = 0;

  private _offset = 0;

  start (pointers: Pointer[]) {
    this.angle = getAngle(pointers);
    this._offset = this.angle - this.rotation;
  }

  move (pointers: Pointer[]) {
    this.changedAngle = getAngle(pointers);
    this.rotation = this.changedAngle - this._offset;
  }

  end (pointers: Pointer[]) {
    //
  }
}