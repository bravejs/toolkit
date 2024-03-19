# Pagination core

This is the base class for pagination components. It is used to create the most basic data required for pagination
components, so that it can be applied to any scene or framework. Based on this data, you can easily define various UI
styles and interactions.

English |
[简体中文](https://github.com/bravejs/pagination-core/blob/main/README.zh.md)

## Install

Using npm:

```
npm i pagination-core -S
```

## Usage

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

## Interface

### Options

```typescript
interface Options {
  // Current page, default 1
  current?: number

  // Total number of entries, default 0
  total?: number

  // Number of entries per page, default 50
  pageSize?: number

  // The maximum number of page numbers, 
  // which will be collapsed when it exceeds this value, 
  // the default is 9
  maxLength?: number
}
```

### Props

```typescript
interface Props {
  // Current page
  current: number

  // Total number of entries
  total: number

  // Number of entries per page
  pageSize: number

  // Maximum page number length
  maxLength: number

  // Total pages
  totalPages: number
}
```

### Pages

```typescript
// List of page numbers, 0 is collapsed item
type Pages = number[]
```

### Instance and methods

```typescript
declare class PaginationCore {
  pages: Pages
  props: Props

  /**
   * Parameters
   * @param options
   * @param callback Execute after each change
   */
  constructor (
    options: Options,
    callback?: (pages: Pages, props: Props) => void
  )

  /**
   * The method of jumping to the previous page.
   * If it is already the first page, this method is invalid.
   */
  prev (): void

  /**
   * The method of jumping to the next page.
   * If it is already the last page, this method is invalid.
   */
  next (): void

  /**
   * The method of jumping to the specified page
   * If the `page` is the current page or is out of range, this method is invalid
   * @param page
   */
  to (page: number): void

  /**
   * Methods to set or update instance parameters
   * @param options
   */
  set (options: Options): void
}
```