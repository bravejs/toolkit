// interface AddEventOptions<Evt> extends AddEventListenerOptions {
//   handler (event: Evt): void
// }

type AddEventListener<Evt> = (event: Evt) => void

type AddEventMap = {
  [K in keyof DocumentEventMap]?: AddEventListener<DocumentEventMap[K]> // | AddEventOptions<DocumentEventMap[K]>
}

interface Options {
  attrs?: Record<string, any>
  class?: Record<string, boolean>
  domAttrs?: Record<string, any>
  data?: Record<string, any>
  on?: AddEventMap
}

type Util = {
  [K in keyof Options]: (el: HTMLElement, key: string, value: any) => void
}

type Children = any[]

const util: Util = {
  domAttrs (el, key, value) { // @ts-ignore
    el[key] = value;
  },

  attrs (el, key, value) {
    el.setAttribute(key, value);
  },

  class (el, key, value) {
    if (value) {
      el.classList.add(key);
    }
  },

  data (el, key, value) {
    el.dataset[key] = value;
  },

  on (el, key, value) {
    el.addEventListener(key, value);
  },
};

function setOptions (el: HTMLElement, options: Options) {
  for (const type in options) { // @ts-ignore
    const param = options[type]; // @ts-ignore
    const handler = param && util[type];

    if (typeof handler === 'function') {
      for (const key in param) {
        handler(el, key, param[key]);
      }
    }
  }
}

function createElement<K extends keyof HTMLElementTagNameMap> (tag: K, children?: Children): HTMLElementTagNameMap[K]
function createElement<K extends keyof HTMLElementTagNameMap> (tag: K, options?: Options, children?: Children): HTMLElementTagNameMap[K]
function createElement (tag: string, children?: Children): HTMLElement
function createElement (tag: string, options?: Options, children?: Children): HTMLElement
function createElement (tag: string, options?: Options | Children, children?: Children): HTMLElement {
  if (Array.isArray(options)) {
    children = options;
    options = void 0;
  }

  const el = document.createElement(tag);

  if (options) {
    setOptions(el, options);
  }

  if (children) {
    for (const child of children) {
      el.appendChild(child instanceof Node ? child : document.createTextNode(child));
    }
  }

  return el;
}

export default createElement;