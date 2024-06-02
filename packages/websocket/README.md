# WebSocket

订阅式、模块化的 WebSocket 连接

## 安装

```shell
npm i @bravejs/websocket
```

## 用法

### 1. 创建一个连接

```ts
import { Connection } from '@bravejs/websocket'

const connection = new Connection({
  url: 'wss://example.com/ws', // 连接地址
  protocols: '', // 连接协议
  binaryType: 'blob', // 数据类型（默认 blob）

  // 数据解析器，服务端响应的可能是字符串、二进制，或者是加密的数据
  // 需要进行自定义的解析逻辑，或者格式化操作
  dataParser (data) {
    return JSON.parse(data)
  }
})
```

### 2. 创建一个订阅

```ts
import { mergeArray } from '@bravejs/websocket'

const subscription = connection.defineSubscription('SubscriptionName', {
  // 根据数据识别是否为当前的订阅
  recognize: (data) => data.type === 'test',

  /**
   * 参数合并
   * @param current 现有参数
   * @param target 目标参数
   */
  mergeParams: (current, target) => {
    return mergeArray(current, target)
  },

  /**
   * 根据订阅的参数筛选
   * @param params 单个订阅者的参数
   * @param data 响应的数据
   */
  filterByParams: (params, data) => {
    return params.indexOf(data.id) < 0 ? null : data // 返回 null 则不会执行当前订阅者的处理器，因为不是当前订阅者的参数，
  },

  /**
   * 设置订阅的动作
   * @param params 参数，包含当前的，和新增的
   * @param flags 标记，是否第一次订阅
   */
  subscribe (params, flags) {
    connection.send({
      action: flags.isFirst ? 'new' : 'add',
      data: params.changed // or params.current
    })
  },

  /**
   * 设置取消订阅的动作
   * @param params 参数，包含当前的，和移除的
   * @param flags 标记，是否最后一次取消订阅
   */
  unsubscribe (params, flags) {
    connection.send({
      action: flags.isLast ? 'cancel' : 'remove',
      data: params.changed
    })
  }
})
```

### 3. 使用订阅

```ts
// 使用订阅
const subscriber = subscription.subscribe([1, 2, 3], (data) => {
  // do some thing...
})

// 更新订阅参数
subscriber.update([3, 4, 5])

// 取消订阅
subscriber.cancel()
```

## 插件

### AutoConnect

自动连接插件

+ 当第一次订阅时，立即自动开启连接
+ 当最后一次取消订阅时，延迟一段时间后自动关闭连接（默认延迟 5s）
+ 连接出现异常中断时，延迟一段时间后自动重新连接（默认延迟 5s）

```ts
import { AutoConnect } from '@bravejs/websocket'

connection.use(AutoConnect, {
  autoOpen: true, // 订阅时自动开启连接，值为 false 时表示关闭（默认开启）
  autoClose: true, // 取消订阅后自动关闭，值为 false 时表示关闭（默认开启），值为数字时，则表示延迟关闭时间（ms）
  autoReconnect: true, // 意外中断时自动重连，值为 false 时表示关闭（默认开启），值为数字时，则表示延迟重连时间（ms）
})
```

### Heartbeat 💗

心跳插件

+ PING: 长时间没有收到服务端响应数据，自动发送字符串 `"ping"`
+ PONG: 当收到服务端的数据为字符串 `"ping"` 时，会立即发送字符串 `"pong"`

```ts
import { Heartbeat } from '@bravejs/websocket'

connection.use(Heartbeat, {
  timeout: 15000, // 超时时间（默认 15s）

  // 自定义 ping
  ping: () => {
    // do some thing...
  },

  // 自定义 pong
  pong: (data: any) => {
    // do some thing...
  }
})
```

### VisibilityChange

切换浏览器窗口时，自动开启或者关闭连接的插件

```ts
import { VisibilityChange } from '@bravejs/websocket'

connection.use(VisibilityChange, {
  delay: 5000 // 隐藏窗口后关闭连接的延迟时间，默认 5s
})
```

## 工具方法

### shared

创建一个可共享的值，以实现全局复用。适用于包含多个不同构建的应用（比如微服务）

```ts
import { shared, Connection } from '@bravejs/websocket'

const connection = shared('SharedName', () => new Connection({
  url: '...',
  // ...
}))
```

### mergeArray

数组合并的方法，因为是模块化的订阅，但是连接始终是同一个，所以通常需要合并一个【订阅】下面的全部【订阅者】的参数。
该方法实现了 去重合并，标记新增数据 的逻辑

```ts
import { mergeArray } from '@bravejs/websocket'

const current = [1, 2, 3]
const target = [3, 4, 5]

const result = mergeArray(current, target)

// result:
// {
//   current: [1, 2, 3, 4, 5],
//   changed: [4, 5]
// }
```

## 框架集成

### React

将【订阅】包装为一个 React hook

+ 当参数变化时，会自动更新订阅
+ 当组件销毁时，会自动取消订阅

```ts
import { toReactHook } from '@bravejs/websocket/integrations/react'

// 创建 hook
const useSubscription = toReactHook(subscription)

// 在 React 组件中使用 hook
useSubscription([1, 2, 3], (data) => {
  // do some thing...
})
```

### Vue

将【订阅】包装为一个 Vue hook

+ 当参数变化时，会自动更新订阅
+ 当组件销毁时，会自动取消订阅

```ts
import { toVueHook } from '@bravejs/websocket/integrations/vue'

// 创建 hook
const useSubscription = toVueHook(subscription)

// Vue 组件中使用 hook
useSubscription([1, 2, 3], (data) => {
  // do some thing...
})
```

## SSR 兼容

因该库仅设计给浏览器端使用，但是我们的项目工程可能同时运行在服务端和客户端，为了避免在服务端环境中执行时可能产生的内存泄露等问题，同时也为了给开发者提供更好的开发体验，在
SSR 环境下添加了如下兼容逻辑：

+ Connection 实例的事件不会被绑定
+ 创建订阅时，将始终返回同一个空订阅。API 不变，但执行不会有任何的作用
+ 使用订阅时，将始终返回一个空订阅者。API 不变，但执行不会任何的作用
+ 插件不会被安装