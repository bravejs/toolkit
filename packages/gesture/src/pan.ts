import { Direction, Pointer, Position } from './types.js';
import { getCenterPosition, getDirection } from './utils.js';
import { ModelBase } from './base.js';

export interface Options {
  pointers?: number
  onStart?: () => void
  onMove?: () => void
  onEnd?: () => void
}

export class PanModel implements ModelBase {
  direction: Direction = null;
  startPosition: Position = { x: 0, y: 0 };
  endPosition: Position = { x: 0, y: 0 };
  translate: Position = { x: 0, y: 0 };

  private _offset: Position = { x: 0, y: 0 };

  start (pointers: Pointer[]) {
    const { _offset, translate } = this;
    const position = getCenterPosition(pointers);

    this.startPosition = position;
    _offset.x = position.x - translate.x;
    _offset.y = position.y - translate.y;
  }

  move (pointers: Pointer[]) {
    const { _offset, startPosition, translate } = this;
    const changedPosition = getCenterPosition(pointers);

    this.endPosition = changedPosition;
    this.direction = getDirection(startPosition, changedPosition);
    translate.x = changedPosition.x - _offset.x;
    translate.y = changedPosition.y - _offset.y;
  }

  end (pointers: Pointer[]) {
    //
  }
}
