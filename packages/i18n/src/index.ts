interface Messages {
  [K: string]: any
}

interface Values {
  [K: string]: any
}

export interface Options {
  locale: string
  fallbackLocale: string
  messages: Messages
}

class I18n {
  locale!: string;
  private _messages!: any;
  private _options!: Options;
  
  constructor (options: Options) {
    this._options = options;
    this.setLocale(options.locale);
  }

  t (key: string, values?: Values): any {
    const keys = key.split('.');
    let result = this._messages;

    for (const attr of keys) {
      if (result) {
        result = result[attr];
      } else {
        break;
      }
    }

    if (typeof result === 'string') {
      result = result.replace(/{[^{]+?}/, (m) => {
        return (values && values[m.substring(1, m.length - 1).trim()]) || '';
      });
    }

    return result;
  }

  setLocale (locale: string) {
    const { _options } = this;
    this.locale = locale;
    this._messages = _options.messages[locale] || _options.messages[_options.fallbackLocale];
  }

  destroy () {
    this._messages = null as any;
    this._options = null as any;
  }
}

export default I18n;