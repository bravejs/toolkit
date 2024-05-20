import { PluginOptions } from '../connection';
import { IN_BROWSER } from '../utils';

export const VisibilityChange: PluginOptions = {
  name: 'VisibilityChange',

  install(connection) {
    if (!IN_BROWSER) {
      return () => {};
    }

    const handleChange = () => {
      if (document.visibilityState === 'hidden') {
        connection.close();
      } else if (connection.subs > 0) {
        connection.open();
      }
    };

    window.addEventListener('visibilitychange', handleChange);

    return () => {
      window.removeEventListener('visibilitychange', handleChange);
    };
  },
};
