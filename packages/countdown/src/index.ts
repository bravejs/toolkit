class Countdown {
  /**
   * state in seconds:
   * -1: not start
   * >0: counting down
   * =0: over
   */
  seconds = -1;
  private _tid: number | NodeJS.Timeout = 0;

  private readonly _update: (seconds: number) => void;

  constructor (onUpdate?: (seconds: number) => void) {
    this._update = (seconds) => {
      this.seconds = seconds;

      if (onUpdate) {
        onUpdate(seconds);
      }
    };
  }

  start (seconds: number) {
    if (seconds > 0 && this.seconds <= 0) {
      this._tick(performance.now(), seconds, 0);
    }
  }

  end () {
    this._set(0);
  }

  reset () {
    this._set(-1);
  }

  cancel () {
    clearTimeout(this._tid);
  }

  private _set (seconds: number) {
    if (this.seconds > seconds) {
      this.cancel();
      this._update(seconds);
    }
  }

  private _tick (startTime: number, totalSeconds: number, passedSeconds: number) {
    this._update(totalSeconds - passedSeconds);

    if (passedSeconds < totalSeconds) {
      this._tid = setTimeout(() => {
        this._tick(
          startTime,
          totalSeconds,
          ((performance.now() - startTime) / 1000) | 0
        );
      }, 1000);
    }
  }
}

export default Countdown;