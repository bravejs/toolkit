import { PluginOptions } from '../connection';
import { IN_BROWSER } from '../utils';

export const VisibilityChange: PluginOptions = {
  name: 'VisibilityChange',

  install (connection) {
    if (!IN_BROWSER) {
      return () => {};
    }

    function handleChange () {
      if (document.visibilityState === 'hidden') {
        connection.close();
      } else if (connection.slc > 0) {
        connection.open();
      }
    }

    window.addEventListener('visibilitychange', handleChange);

    return () => {
      window.removeEventListener('visibilitychange', handleChange);
    };
  },
};