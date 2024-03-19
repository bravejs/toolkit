import { getCenterPosition, getDirection } from './utils.js';
import { Direction, Pointer, Position } from './types.js';
import { ModelBase } from './base.js';

export class SwipeModel implements ModelBase {
  direction: Direction = null;
  startPosition: Position = { x: 0, y: 0 };
  endPosition: Position = { x: 0, y: 0 };

  start (pointers: Pointer[]) {
    this.startPosition = getCenterPosition(pointers);
  }

  move (pointers: Pointer[]) {
    //
  }

  end (pointers: Pointer[]) {
    const changedPosition = getCenterPosition(pointers);

    this.endPosition = changedPosition;
    this.direction = getDirection(this.startPosition, changedPosition);
  }
}