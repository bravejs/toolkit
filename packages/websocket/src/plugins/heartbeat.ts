import { PluginOptions } from '../connection';

interface Options {
  interval?: number; // ms
  onMessage?: (evt: MessageEvent) => void;
  onTimeout?: () => void;
}

export const Heartbeat: PluginOptions<Options> = {
  name: 'Heartbeat',

  install (connection, options) {
    const {
      interval = 15000,
      onMessage,
      onTimeout = () => {
        connection.send('ping');
      },
    } = options || {};

    const clear = () => {
      clearTimeout(pingTimer);
    };

    const start = () => {
      clear();
      pingTimer = setTimeout(onTimeout, interval);
    };

    const handleMessage = (evt: MessageEvent) => {
      if (onMessage) {
        onMessage(evt);
      }

      start();
    };

    let pingTimer: any;

    connection.on('open', start)
      .on('message', handleMessage)
      .on('close', clear);

    return () => {
      connection.off('open', start)
        .off('message', handleMessage)
        .off('close', clear);
    };
  },
};