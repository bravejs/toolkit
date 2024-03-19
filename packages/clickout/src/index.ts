class Clickout {
  elements: HTMLElement[] | null = null;
  private readonly _listener: (evt: MouseEvent) => void;
  
  constructor (listener: (evt: MouseEvent) => void) {
    this._listener = (evt: MouseEvent) => {
      for (const el of this.elements!) {
        if (el.contains(evt.target as Node)) {
          return;
        }
      }

      listener(evt);
      this.cancel();
    };
  }

  listen (elements: HTMLElement[]) {
    this.elements = elements;
    document.addEventListener('click', this._listener, true);
  }

  cancel () {
    this.elements = null;
    document.removeEventListener('click', this._listener, true);
  }
}

export default Clickout;