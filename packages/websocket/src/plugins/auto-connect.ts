import { PluginOptions } from '../connection';
import { SubsChangeEvent } from '../connection-event-target';

interface Options {
  autoOpen?: boolean;
  autoClose?: boolean | number;
  autoReconnect?: boolean | number;
}

export const AutoConnect: PluginOptions<Options> = {
  name: 'AutoConnect',

  install(connection, options) {
    const getDelay = (k: keyof Options) => {
      const value = options?.[k];

      return value === false ? 0 : typeof value === 'number' ? value : 5000;
    };

    const clear = () => {
      clearTimeout(closeTimer);
      clearTimeout(reconnectTimer);
    };

    const handleClose = (evt: CloseEvent) => {
      clear();

      // Normal close
      if (evt.code === 1000) {
        return;
      }

      const delay = getDelay('autoReconnect');

      if (delay > 0) {
        reconnectTimer = setTimeout(() => {
          connection.open();
        }, delay);
      }
    };

    const handleSubsChange = (evt: SubsChangeEvent) => {
      const { subs, action } = evt.detail;

      clear();

      // Subscribe action
      if (action === 1) {
        if (subs === 1 && options?.autoOpen !== false) {
          connection.open();
        }
      }

      // Unsubscribe action
      else if (subs === 0) {
        const delay = getDelay('autoClose');

        if (delay > 0) {
          closeTimer = setTimeout(() => {
            connection.close();
          }, delay);
        }
      }
    };

    let closeTimer: any;
    let reconnectTimer: any;

    connection
      .on('subschange', handleSubsChange)
      .on('close', handleClose)
      .on('open', clear);

    return () => {
      connection
        .off('subschange', handleSubsChange)
        .off('close', handleClose)
        .off('open', clear);
    };
  },
};
