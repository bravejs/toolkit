import { Direction, GestureEvent, Pointer, Position } from './types.js';

function isTouchEvent (evt: GestureEvent): evt is TouchEvent {
  return typeof TouchEvent !== 'undefined' && evt instanceof TouchEvent;
}

export function getPointers (source: GestureEvent | GestureEvent[], isEnd?: boolean, pointers?: Pointer[]): Pointer[] {
  if (!pointers) {
    pointers = [];
  }

  if (Array.isArray(source)) {
    for (const sourceElement of source) {
      getPointers(sourceElement, isEnd, pointers);
    }
  } else if (isTouchEvent(source)) {
    const touches = isEnd ? source.changedTouches : source.touches;

    for (const touch of touches) {
      pointers.push(touch);
    }
  } else {
    pointers.push(source);
  }

  return pointers;
}

function parseOriginValue (source: string, max: number) {
  if (source) {
    const value = parseFloat(source);

    return source.indexOf('%') > 0 ? value / 100 * max : value;
  }

  return max / 2;
}

export function getBoundingClientCenter (el: HTMLElement) {
  const styleCache = el.style.transform;

  el.style.transform = 'none';

  const rect = el.getBoundingClientRect();
  const origin = getComputedStyle(el).transformOrigin.split(' ');

  el.style.transform = styleCache;

  return {
    clientX: rect.left + parseOriginValue(origin[0], rect.width),
    clientY: rect.top + parseOriginValue(origin[1], rect.height)
  };
}

export function getCenterPosition (pointers: Pointer[]): Position {
  const length = pointers.length;
  let x = 0;
  let y = 0;

  for (const point of pointers) {
    x += point.clientX;
    y += point.clientY;
  }

  return {
    x: x / length,
    y: y / length
  };
}

export function getDistance (pointers: Pointer[]) {
  let totalDistance = 0;

  for (let index = 1; index < pointers.length; index++) {
    const a = pointers[index - 1];
    const b = pointers[index];

    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;

    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  return totalDistance;
}

export function getAngle (pointers: Pointer[]) {
  let totalRadians = 0;

  for (let index = 1; index < pointers.length; index++) {
    const a = pointers[index - 1];
    const b = pointers[index];

    totalRadians += Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
  }

  return totalRadians * 180 / Math.PI;
}

export function getDirection (a: Position, b: Position): Direction {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}