class LocalStorage<T> {
  private _storage: Storage;

  key: string;

  constructor (key: string, session?: boolean) {
    this.key = key;
    this._storage = session ? sessionStorage : localStorage;
  }

  get (): T | string | null {
    const value = this._storage.getItem(this.key);

    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }

    return null;
  }

  set (value: T) {
    this._storage.setItem(this.key, JSON.stringify(value));
  }

  remove () {
    this._storage.removeItem(this.key);
  }
}

export default LocalStorage;