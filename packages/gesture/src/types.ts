export type Direction = 'up' | 'right' | 'down' | 'left' | null

export interface Position {
  x: number
  y: number
}

export interface Pointer {
  clientX: number
  clientY: number
}

export type GestureEvent = MouseEvent | PointerEvent | TouchEvent

export interface TapModelBase {
  start (pointers: Pointer[]): void

  end (pointers: Pointer[]): void
}

export interface TransformModelBase extends TapModelBase {
  move (pointers: Pointer[]): void
}
