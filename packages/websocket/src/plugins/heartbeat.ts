import { PluginOptions } from '../connection';

interface Options {
  timeout?: number; // ms
  ping?: () => void;
  pong?: (data: any) => void;
}

export const Heartbeat: PluginOptions<Options> = {
  name: 'Heartbeat',

  install(connection, options) {
    const opts: Required<Options> = {
      timeout: 15000,
      ping: () => {
        connection.nativeSend('ping');
      },
      pong: (data) => {
        if (data === 'ping') {
          connection.nativeSend('pong');
        }
      },
      ...options,
    };

    const clear = () => {
      clearTimeout(pingTimer);
    };

    const start = () => {
      clear();
      pingTimer = setTimeout(opts.ping, opts.timeout);
    };

    const handleMessage = (evt: MessageEvent) => {
      opts.pong(evt.data);
      start();
    };

    let pingTimer: any;

    connection
      .on('open', start)
      .on('message', handleMessage)
      .on('close', clear);

    return () => {
      connection
        .off('open', start)
        .off('message', handleMessage)
        .off('close', clear);
    };
  },
};
