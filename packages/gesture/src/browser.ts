import { PanModel } from './pan.js';
import { PinchModel } from './pinch.js';
import { RotateModel } from './rotate.js';
import { getBoundingClientCenter, getPointers } from './utils.js';
import { GestureEvent, Pointer } from './types.js';
import { SwipeModel } from './swipe.js';

let EVENT_START: 'mousedown' | 'pointerdown' | 'touchstart' = 'mousedown';
let EVENT_MOVE: 'mousemove' | 'pointermove' | 'touchmove' = 'mousemove';
let EVENT_END: 'mouseup' | 'pointerup' | 'touchend' = 'mouseup';

export function initEventType () {
  if ('ontouchstart' in window) {
    EVENT_START = 'touchstart';
    EVENT_MOVE = 'touchmove';
    EVENT_END = 'touchend';
  } else if ('onpointerdown' in window) {
    EVENT_START = 'pointerdown';
    EVENT_MOVE = 'pointermove';
    EVENT_END = 'pointerup';
  }
}

initEventType();

type TransformModel = PanModel | PinchModel | RotateModel

class Mask {
  private _el: HTMLElement | null = null;

  private _create () {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:0;top:0;width:100%;height:100%;z-index:9999999999;`;
    return el;
  }

  show () {
    this._el = this._el || this._create();
    document.body.appendChild(this._el!);
  }

  hide () {
    this._el?.parentNode?.removeChild(this._el);
  }
}

const mask = new Mask();

export function useTransform<T extends TransformModel | TransformModel[]> (el: HTMLElement, models: T, handler: (models: T) => void) {
  function handleStart (evt: GestureEvent) {
    const pointers = getPointers(evt);
    let startPointer: Pointer | undefined;

    for (const model of transformModels) {
      if (evt.shiftKey) {
        startPointer = startPointer || getBoundingClientCenter(el);
        startPointerMap.set(model, startPointer);
        model.start([startPointer, ...pointers]);
      } else {
        startPointerMap.set(model, null);
        model.start(pointers);
      }
    }

    mask.show();

    document.addEventListener(EVENT_MOVE, handleMove);
    document.addEventListener(EVENT_END, handleEnd);
  }

  function handleMove (evt: GestureEvent) {
    const pointers = getPointers(evt);

    for (const model of transformModels) {
      const startPointer = startPointerMap.get(model);

      if (startPointer) {
        model.move([startPointer, ...pointers]);
      } else {
        model.move(pointers);
      }
    }

    handler(models);
  }

  function handleEnd (evt: GestureEvent) {
    const pointers = getPointers(evt);

    for (const model of transformModels) {
      model.end(pointers);
    }

    document.removeEventListener(EVENT_MOVE, handleMove);
    document.removeEventListener(EVENT_END, handleEnd);

    mask.hide();
  }

  const transformModels = Array.isArray(models) ? models : [models];
  const startPointerMap = new Map<TransformModel, Pointer | null>();

  el.addEventListener(EVENT_START, handleStart);

  return function () {
    el.removeEventListener(EVENT_START, handleStart);
  };
}

export function useSwipe (el: HTMLElement, model: SwipeModel, handler: any) {
  function handleStart (evt: GestureEvent) {
    model.start(getPointers(evt));

    mask.show();
    document.addEventListener(EVENT_END, handleEnd);
  }

  function handleEnd (evt: GestureEvent) {
    model.end(getPointers(evt, true));
    handler(model);
    document.removeEventListener(EVENT_END, handleEnd);
    mask.hide();
  }

  el.addEventListener(EVENT_START, handleStart);

  return function () {
    el.removeEventListener(EVENT_START, handleStart);
  };
}