import { Pointer } from './types.js';

export declare class ModelBase {
  start (pointers: Pointer[]): void

  end (pointers: Pointer[]): void
}

export declare class TransformModelBase extends ModelBase {
  move (pointers: Pointer[]): void
}