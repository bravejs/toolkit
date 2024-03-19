class WheelModel {
  wheelDelta = 0;
  wheelDeltaX = 0;
  wheelDeltaY = 0;

  private _timer: any = null;

  start (evt: WheelEvent) {

  }

  wheel (evt: WheelEvent) {
    if (this._timer) {
      clearTimeout(this._timer);
    } else {
      this.start(evt);
    }

    this._timer = setTimeout(() => {
      this.end(evt);
      this._timer = null;
    }, 100);
  }

  end (evt: WheelEvent) {

  }
}