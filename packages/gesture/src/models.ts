import { ModelBase, TransformModelBase } from './base';
import { Direction, Pointer, Position } from './types';
import { getAngle, getCenterPosition, getDirection, getDistance } from './utils';
import { clearTimeout } from 'timers';

export class Tap implements ModelBase {
  start (pointers: Pointer[]) {

  }

  end (pointers: Pointer[]) {

  }
}

export class PanModel implements TransformModelBase {
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

export class PinchModel implements TransformModelBase {
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

export class PressModel implements ModelBase {
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

export class RotateModel implements TransformModelBase {
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

export class SwipeModel implements ModelBase {
  direction: Direction = null;
  startPosition: Position = { x: 0, y: 0 };
  endPosition: Position = { x: 0, y: 0 };

  start (pointers: Pointer[]) {
    this.startPosition = getCenterPosition(pointers);
  }

  end (pointers: Pointer[]) {
    const changedPosition = getCenterPosition(pointers);

    this.endPosition = changedPosition;
    this.direction = getDirection(this.startPosition, changedPosition);
  }
}