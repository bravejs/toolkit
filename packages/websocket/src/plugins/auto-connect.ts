import { PluginOptions } from '../connection';
import { SLCChangeEvent } from '../event-target';

interface Options {
  autoClose?: boolean | number
  autoReconnect?: boolean | number
}

export const AutoConnect: PluginOptions<Options> = {
  name: 'AutoConnect',

  install (connection, options) {
    let reconnectTimer: any;
    let closeTimer: any;

    function getDelay (k: keyof Options): number {
      const value = options?.[k];

      if (value === false) {
        return 0;
      }

      return (!value || value === true) ? 5000 : value;
    }

    function clear () {
      clearTimeout(closeTimer);
      clearTimeout(reconnectTimer);
    }

    function handleClose (evt: CloseEvent) {
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
    }

    function handleSLCChange (evt: SLCChangeEvent) {
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
    }

    connection.on('SLCChange', handleSLCChange)
      .on('close', handleClose)
      .on('open', clear);

    return () => {
      connection.off('SLCChange', handleSLCChange)
        .off('close', handleClose)
        .off('open', clear);
    };
  },
};