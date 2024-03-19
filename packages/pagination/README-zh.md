# Pagination core

这是分页组件的基类。用于创建分页组件所需的最基本数据，以便它可以应用于任何场景或框架。基于这些数据，您可以轻松定义各种 UI 风格和交互。

[English](https://github.com/bravejs/pagination-core/blob/main/README.md)
| 简体中文

## 安装

使用 npm:

```
npm i pagination-core -S
```

## 使用

```typescript
import PaginationCore from 'pagination-core'

const instance = new PaginationCore(
  {
    current: 1,
    total: 100,
    pageSize: 50,
    maxLength: 9
  },
  (pages, props) => {
    // ...
  }
)
```

## 接口

### 选项

```typescript
interface Options {
  // 当前页，默认 1
  current?: number

  // 总条目数量，默认 0
  total?: number

  // 每页条目数量，默认 50
  pageSize?: number

  // 最大页码长度, 
  // 当总页数超过该值时会折叠, 
  // 默认为 9
  maxLength?: number
}
```

### 属性

```typescript
interface Props {
  // 当前页
  current: number

  // 总条目数量
  total: number

  // 每页条目数量
  pageSize: number

  // 最大页码长度
  maxLength: number

  // 总页数
  totalPages: number
}
```

### 页码列表

```typescript
// 页码列表，0 表示为折叠项
type Pages = number[]
```

### 实例和方法

```typescript
declare class PaginationCore {
  pages: Pages
  props: Props

  /**
   * 参数
   * @param options 选项
   * @param callback 回调函数，每次变化后执行
   */
  constructor (
    options: Options,
    callback?: (pages: Pages, props: Props) => void
  )

  /**
   * 跳转上一页的方法
   * 如果已经是第一页，该方法执行无效
   */
  prev (): void

  /**
   * 跳转下一页的方法
   * 如果已经是最后一页，该方法执行无效
   */
  next (): void

  /**
   * 跳转到指定页的方法
   * 如果 `page` 是当前页或者超出范围，该方法执行无效
   * @param page 页码
   */
  to (page: number): void

  /**
   * 设置或者更新选项的方法
   * @param options 选项
   */
  set (options: Options): void
}
```