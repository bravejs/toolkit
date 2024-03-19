type Listener = (evt: Event) => void

type EventOn = 'click' | 'focus' | 'mousedown' | 'mouseenter'

type EventOff = 'click' | 'blur' | 'mouseup' | 'mouseleave'

export type Refs = Array<Window | Document | HTMLElement>

export type ActionName =
  | 'hover'
  | 'click'
  | 'press'
  | 'focus'
  | 'manual'

export type ActionGroup = [EventOn, EventOff] | [string, string]

export type Action = ActionName | ActionGroup

export type Delay = number | number[]

export interface Options {
  refs: Refs
  callback: (active: boolean) => void
  action?: Action
  delay?: Delay
}

function contains (refs: Refs, target: EventTarget | null) {
  for (const ref of refs) {
    if (ref instanceof Node && ref.contains(target as Node)) {
      return true;
    }
  }

  return false;
}

function bind (refs: Refs | null, event: string, listener: Listener) {
  const capture = !refs;

  if (capture) {
    refs = [document];
  }

  let executor = (action: 'add' | 'remove') => {
    for (const ref of refs!) {
      ref[`${action}EventListener`](event, listener, capture);
    }
  };

  executor('add');

  return () => {
    if (executor) {
      executor('remove');
      executor = null as any;
    }
  };
}

function getAction (action?: Action): ActionGroup | null {
  if (Array.isArray(action)) {
    return action;
  }

  switch (action) {
    case 'manual':
      return null;

    case 'click':
      return [action, action];

    case 'press':
      return ['mousedown', 'mouseup'];

    case 'focus':
      return [action, 'blur'];

    // case 'hover':
    default:
      return ['mouseenter', 'mouseleave'];
  }
}

function getDelay (delay?: Delay): number[] | null {
  return typeof delay === 'number' ? [delay, delay] : Array.isArray(delay) ? delay : null;
}

class Toggle {
  active = false;

  private _refs: Refs;
  private _action: ActionGroup | null;
  private _delay: number[] | null;
  private _callback: () => void;
  private _unbind: () => void = () => {};
  private _unbindOff: () => void = () => {};
  private _tid: any = null;

  constructor (options: Options) {
    this._refs = [...options.refs];
    this._action = getAction(options.action);
    this._delay = getDelay(options.delay);

    this._callback = () => {
      options.callback(this.active = !this.active);
    };

    this._bind();
  }

  on () {
    this._call(!this.active) && this._bindOff();
  }

  off () {
    this._call(this.active) && this._unbindOff();
  }

  toggle () {
    this.active ? this.off() : this.on();
  }

  setAction (action: ActionName | ActionGroup) {
    this._action = getAction(action);
    this._bind();
  }

  setRefs (refs: Refs) {
    this._refs = [...refs];
    this._bind();
  }

  setDelay (delay: Delay) {
    this._delay = getDelay(delay);
  }

  cancel () {
    if (this._tid) {
      clearTimeout(this._tid);
    }
  }

  destroy () {
    this.cancel();
    this._unbind();
    this._unbindOff();
    this._refs = null as any;
    this._action = null;
    this._delay = null;
    this._callback = null as any;
    this._unbind = null as any;
    this._unbindOff = null as any;
  }

  private _call (check: boolean) {
    this.cancel();

    if (check) {
      const { _delay, _callback } = this;
      const delay = _delay && _delay[this.active ? 1 : 0];

      if (delay) {
        this._tid = setTimeout(_callback, delay);
      } else {
        _callback();
      }
    }

    return check;
  }

  private _bind () {
    const { _refs, _action } = this;

    this._unbind();

    if (_action) {
      this._unbind = bind(_refs, _action[0], () => {
        this.on();
      });
    }
  }

  private _bindOff () {
    const { _refs, _action } = this;

    this._unbindOff();

    if (_action) {
      const eventOff = _action[1];
      let refs: Refs | null = null;

      let listener: Listener = () => {
        this.off();
      };

      switch (eventOff) {
        case 'mouseleave': {
          refs = _refs;

          listener = (evt) => {
            contains(_refs, (evt as MouseEvent).relatedTarget) || this.off();
          };

          break;
        }

        case 'click': {
          // refs = null
          listener = (evt) => {
            contains(_refs, evt.target) || this.off();
          };

          break;
        }

        case 'mouseup': {
          // refs = null
          break;
        }

        // case 'blur':
        default: {
          refs = _refs;
        }
      }

      this._unbindOff = bind(refs, eventOff, listener);
    }
  }
}

export default Toggle;