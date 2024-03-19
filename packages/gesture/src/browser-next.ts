import { getPointers } from './utils';
import { GestureEvent } from './types';

let EVENT_TYPE_START: 'mousedown' | 'pointerdown' | 'touchstart' = 'mousedown';
let EVENT_TYPE_MOVE: 'mousemove' | 'pointermove' | 'touchmove' = 'mousemove';
let EVENT_TYPE_END: 'mouseup' | 'pointerup' | 'touchend' = 'mouseup';

let initEventType = () => {
  if ('ontouchstart' in window) {
    EVENT_TYPE_START = 'touchstart';
    EVENT_TYPE_MOVE = 'touchmove';
    EVENT_TYPE_END = 'touchend';
  } else if ('onpointerdown' in window) {
    EVENT_TYPE_START = 'pointerdown';
    EVENT_TYPE_MOVE = 'pointermove';
    EVENT_TYPE_END = 'pointerup';
  }

  initEventType = noop;
};

function noop () {
  // noop
}

function bindEvent<T extends keyof DocumentEventMap> (el: HTMLElement | Document, type: T, handler: (evt: any) => any) {
  el.addEventListener(type, handler, false);

  return () => {
    el.removeEventListener(type, handler, false);
  };
}

/**
 * Pan, Pinch, Rotate
 */
export function useTransform (el: HTMLElement, models: any[], hooks: object) {
  initEventType();

  function run (type: 'start' | 'move' | 'end', evt: GestureEvent) {
    const pointers = getPointers(evt);

    for (const model of models) {
      model.start(pointers);
    }
  }

  return bindEvent(el, EVENT_TYPE_START, (evt) => {
    run('start', evt);

    const move = bindEvent(document, EVENT_TYPE_MOVE, (evt) => {
      run('move', evt);
    });

    const end = bindEvent(document, EVENT_TYPE_END, (evt) => {
      run('end', evt);

      move();
      end();
    });
  });
}

/**
 * Tap, Swipe, Press,
 */
export function useTap (el: HTMLElement, models: any[]) {
  initEventType();

  function run (type: 'start' | 'end', evt: GestureEvent) {
    const pointers = getPointers(evt);

    for (const model of models) {
      model.start(pointers);
    }
  }

  return bindEvent(el, EVENT_TYPE_START, (evt) => {
    run('start', evt);

    const end = bindEvent(document, EVENT_TYPE_END, (evt) => {
      run('end', evt);

      end();
    });
  });
}

/**
 * Wheel
 */
export function useWheel (el: HTMLElement) {
  initEventType();

  return bindEvent(el, 'wheel', (evt) => {

  });
}