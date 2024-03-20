# WebSocket

## 1. 安装

```bash
npm i @bravejs/websocket
```

## 2. 创建连接实例

声明响应数据的基础结构类型

```ts
interface BaseMessage {
  type: string
}
```

自定义逻辑处理`事件识别`、`参数重写`和`数据转换`

```ts
import WS from '@bravejs/websocket'

const ws = new WS<BaseMessage>({
  url: 'wss://demo.com/ws',

  // 事件识别
  recognize (data: BaseResponse) {
    return data.type
  },

  // 重写发送的数据
  transformParams (data) {
    return {
      ...data,
      token: 123,
    }
  },

  // 转换响应的数据
  transformMessage (res): BaseMessage {
    return res.data
  },
})
```

## 3. 定义订阅模型（行情报价示例）

声明模型的`参数`和`响应`类型

```ts
interface SymbolItem {
  name: string
  time: number
  high: number
  open: number
  low: number
  close: number
}

// 订阅参数：品种名称集合
type Params = string[]

// 响应数据
interface Response extends BaseMessage {
  type: 'quotation',
  list: SymbolItem[]
}
```

自定义订阅的参数处理逻辑

```ts
const quotation = ws.defineSubscription<Params, Response>('quotation', (context) => {
  return {
    // 合并参数并且去重
    mergeParams (list) {
      return Array.from(new Set(list.flat()))
    },

    // 数据过滤器，可选
    filter (params, data) {
      return data.list.filter((item) => {
        return params.indexOf(item.name) >= 0
      })
    },

    // 订阅钩子，自定义参数发送逻辑
    subscribe (params) {
      context.send({
        params,
        type: 'quotation',
        action: 'subscribe',
      })
    },

    // 更新订阅钩子，自定义参数发送逻辑
    update (type, target, params) {
      switch (type) {
        case 'add': {
          context.send({
            target,
            type: 'quotation',
            action: 'update:add',
          })
          break
        }

        case 'remove': {
          context.send({
            target,
            type: 'quotation',
            action: 'update:remove',
          })
          break
        }
      }
    },

    // 取消订阅钩子，自定义参数发送逻辑
    unsubscribe (params) {
      context.send({
        type: 'quotation',
        action: 'unsubscribe'
      })
    }
  }
})
```

## 4. 发起订阅

订阅者

```ts
interface Subscriber<T> {
  params: T
  update: (params: T) => void // 更新订阅参数
  cancel: () => void // 取消订阅
}
```

订阅执行流程

```ts
// step 1
// 首次订阅
// 触发 subscribe 并自动启动连接 🟢
const quote1 = quotation.subscribe(['BTCUSDT'], (data) => {
  // do something...
})

// 初始参数: ['BTCUSDT']

// step 2
// 第二次订阅，相当于添加参数，在 mergeParams 方法中处理合并逻辑
// 触发 update: add ➕
const quote2 = quotation.subscribe(['ETHUSDT'], (data) => {
  // do something...
})

// 合并后的参数: ['BTCUSDT', 'ETHUSDT']

// step 3
// 更新参数，先移除旧参数，再添加新参数
// 触发 update:remove ➖ & update:add ➕
quote1.update(['BNBUSDT'])

// 更新后的参数: ['BNBUSDT', 'ETHUSDT']

// step 4
// 取消订阅，因为当前还存在其他的订阅者，所以相当于移除参数
// 触发 update:remove ➖
quote1.cancel()

// 移除后的参数: ['ETHUSDT']

// step 5
// 取消订阅，当前是最后一个订阅者
// 触发 unsubscribe 并自动关闭连接 🔴
quote2.cancel()
```
