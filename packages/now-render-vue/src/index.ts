import { createApp, h, onBeforeUnmount, onUnmounted } from 'vue';
import type { App, Component } from 'vue';

interface Options {
  root?: HTMLElement | null // 挂载的根结点元素，为 null 则不自动挂载，默认为 <body>
}

type InitHandler = (app: App) => void

let initHandler: InitHandler | null = null;

export function initRenderComponent (handler: InitHandler) {
  initHandler = handler;
}

export function renderComponent (component: Component, props?: object, options?: Options) {
  const container = document.createElement('div');

  const app = createApp({
    setup: () => {
      onUnmounted(() => {
        container.parentNode?.removeChild(container);
      });

      return () => h(component, props);
    }
  });

  const root = options?.root;

  if (root !== null) {
    (root || document.body).appendChild(container);
  }

  if (initHandler) {
    initHandler(app);
  }

  app.mount(container);

  return app;
}

export function useComponent (component: Component, options?: Options) {
  const appList: App[] = [];

  const remove = (app: App) => {
    const index = appList.indexOf(app);

    if (index >= 0) {
      appList.splice(index, 1);
    }
  };

  onBeforeUnmount(() => {
    for (const app of appList) {
      app.unmount();
    }
  });

  return (props?: object) => {
    return new Promise((resolve) => {
      const app = renderComponent(component, {
        ...props,
        onResolve: (value?: any) => {
          resolve(value);
          app.unmount();
          remove(app);
        }
      }, options);

      appList.push(app);
    });
  };
}