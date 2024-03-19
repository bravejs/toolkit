# Countdown

## Installation

```
npm i @bravejs/countdown
```

## Example

```ts
import Countdown from '@bravejs/countdown'

const countdown = new Countdown((seconds: number) => {
  console.log(seconds)
})

countdown.start(60)

countdown.seconds // 60,59,58,57,56,55...
```

## Interface

State in seconds:

+ `-1`: not started
+ `>0`: counting down
+ `=0`: over

```ts
declare class Countdown {
  seconds: number;

  constructor (cb?: (seconds: number) => void);

  start (seconds: number): void;

  end (): void;

  reset (): void;

  cancel (): void;
}
```
