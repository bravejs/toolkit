import { PluginOptions } from '../connection';
import { SLCChangeEvent } from '../connection-event-target';

interface Options {
  autoClose?: boolean | number
  autoReconnect?: boolean | number
}

export const AutoConnect: PluginOptions<Options> = {
  name: 'AutoConnect',

  install (connection, options) {
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

      if (delay) {
        reconnectTimer = setTimeout(() => {
          connection.open();
        }, delay);
      }
    };

    const handleSLCChange = (evt: SLCChangeEvent) => {
      const { slc, action } = evt.detail;

      clear();

      // Subscribe action
      if (action === 1) {
        if (slc === 1) {
          connection.open();
        }

        return;
      }

      // Unsubscribe action
      if (slc === 0) {
        const delay = getDelay('autoClose');

        if (delay) {
          closeTimer = setTimeout(() => {
            connection.close();
          }, delay);
        }
      }
    };

    let closeTimer: any;
    let reconnectTimer: any;

    connection.on('slcchange', handleSLCChange)
      .on('close', handleClose)
      .on('open', clear);

    return () => {
      connection.off('slcchange', handleSLCChange)
        .off('close', handleClose)
        .off('open', clear);
    };
  },
};