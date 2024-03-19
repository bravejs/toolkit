/**
 * 分页获取数据的模型
 */

export interface State {
  ready: boolean; // 表示数据数据就绪（第 1 页是否请求到数据）
  loading: boolean;
  error: any;
  empty: boolean;
}

export interface Params {
  pageIndex: number;
  pageSize: number;
  sortOrder: any; // 排序方向：正序，倒序 ...
  sortField: any; // 排序字段
}

export interface Options<T1 extends object, T2> {
  fetch: (params: Params) => Promise<T1>;
  getItems: (data: T1) => T2[];
  getTotal: (data: T1) => number;
  defaultParams?: Partial<Params>;
  concat?: boolean | 'before' | 'after'; // 合并数组，除了 'before'，非 falsely 的值都认为是 'after'
}

class PagingFetchModel<T1 extends object, T2> {
  private _options: Options<T1, T2>;
  private _fetchId = 0;

  state!: State;
  params!: Params;

  data!: T1 | null;
  items!: T2[];
  total!: number;

  constructor (options: Options<T1, T2>) {
    this._options = options;
    this._init(true);
  }

  private _init (force?: boolean) {
    this.state = {
      ready: false,
      loading: false,
      error: null,
      empty: false
    };

    this.params = {
      pageIndex: 1,
      pageSize: 20,
      sortOrder: null,
      sortField: null,
      ...this._options.defaultParams
    };

    if (force) {
      this.data = null;
      this.items = [];
      this.total = 0;
    }
  }

  setParams<K extends keyof Params> (key: K, value: Params[K]) {
    this.params[key] = value;
  }

  fetch () {
    const { _options, state, params } = this;
    const fetchId = ++this._fetchId;
    // 检查本次请求是否已经被覆盖
    const overwritten = () => fetchId !== this._fetchId;

    state.loading = true;
    state.error = null;
    state.empty = false;

    return _options
      .fetch(params)
      .then((data) => {
        if (overwritten()) {
          return;
        }

        let newItems = _options.getItems(data) || [];

        if (newItems.length > 0) {
          // 合并数组，只有数据就绪了才需要执行，否则就只用本次请求的结果
          if (_options.concat) {
            if (state.ready) {
              // 向前合并
              if (_options.concat === 'before') {
                newItems = newItems.concat(this.items);
              }

              // 向后合并
              else {
                newItems = this.items.concat(newItems);
              }
            }

            // 页码自动递增 1
            params.pageIndex += 1;
          }

          // 标记数据已就绪
          state.ready = true;
        }

        // 第 1 页为空则表示没有任何数据
        else if (!state.ready) {
          state.empty = true;
        }

        this.data = data;
        this.items = newItems;
        this.total = _options.getTotal(data) || 0;
        //
        state.loading = false;
      })
      .catch((err) => {
        if (overwritten()) {
          return;
        }

        state.error = err || true;
        state.loading = false;
      });
  }

  reset (force?: boolean) {
    if (this._fetchId === 0) {
      return;
    }

    this._fetchId = 0;
    this._init(force);
  }

  resetAndFetch (force?: boolean) {
    this.reset(force);

    return this.fetch();
  }
}

export default PagingFetchModel;