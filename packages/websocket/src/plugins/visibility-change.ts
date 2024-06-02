import { PluginOptions } from '../connection';

interface Options {
  delay?: number;
}

export const VisibilityChange: PluginOptions<Options> = {
  name: 'VisibilityChange',

  install(connection, options) {
    const delay = options?.delay || 5000;

    const handleChange = () => {
      clear();

      if (document.visibilityState === 'hidden') {
        closeTimer = setTimeout(() => {
          connection.close();
        }, delay);
      } else if (connection.subs > 0) {
        connection.open();
      }
    };

    const clear = () => {
      clearTimeout(closeTimer);
    };

    let closeTimer: any;

    window.addEventListener('visibilitychange', handleChange);

    return () => {
      window.removeEventListener('visibilitychange', handleChange);
      clear();
    };
  },
};
