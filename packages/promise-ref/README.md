# PromiseRef

PromiseRef 是一个基于 Promise 的 React 组件封装方式，旨在简化处理组件异步输入和输出的场景。

## 功能特点

#### 基于 Promise 的调用方式

PromiseRef 采用基于 Promise 的调用方式，这样我们就可以灵活的控制组件的异步输入和输出流程。组件内部会在适当的时机调用
resolve 或 reject 回调来返回结果。这种调用方式遵循了一种规范化的异步操作模式，使得组件的使用和管理变得更加可靠和一致。

#### 调用的独立性

每次调用组件都会生成一个全新的独立的实例。它们不共享调用状态，也不会存在状态缓存等问题。无论是在单个页面中多次调用同一个组件，还是在不同页面中使用相同组件的多个实例，都可以保证它们之间的相互独立性。

#### 按需渲染

组件只在需要时才会进行渲染。这种渲染方式可以根据特定的事件或外部条件触发，使得渲染逻辑更加灵活可控。例如，当用户点击一个按钮或满足某个条件时，我们才会调用组件。这种按需渲染的方式可以有效地提高页面加载速度和性能，同时也能够减少不必要的渲染和资源消耗。

#### 阅后即焚

组件渲染的结果是临时的，一旦使用完成就会立即销毁，类似于阅后即焚的效果。这种特性使得
PromiseRef 更加适用于临时性和一次性的场景，同时也能提升程序性能。

## Interface

```typescript
import { type JSX } from 'react'

/**
 * PromiseRef 组件基本参数
 * @property resolve Promise 的 resovle 回调函数
 * @property reject Promise 的 reject 回调函数
 */
interface PromiseRefProps<V> {
  resolve: (value: V) => void;
  reject: (reason?: any) => void;
}

/**
 * 插槽组件类型
 * @property displayName Slot 组件显示的名称
 */
type Slot = (() => JSX.Element | null) & {
  displayName?: string;
};

/**
 * 创建引用实例，`usePromiseRef` 是一个 Hook，因此必须在组件的顶层调用
 * @param render 渲染器（React 函数组件）
 */
declare function usePromiseRef<P extends PromiseRefProps<any>> (render: (props: P) => JSX.Element): {
  /**
   * 组件渲染插槽。这是一个组件，可放在 tsx 中你想放的任意位置
   */
  Slot: Slot;
  
  /**
   * 调用组件（将在插槽指定的位置渲染）
   * 这会返回一个 promise，可以非常灵活的控制组件输入输出的流程
   * @param props
   */
  render: (props?: Omit<P, 'resolve' | 'reject'>) => Promise<Parameters<P['resolve']>[0]>;
};
```

## 示例

让我们来做一个用户列表，并包含使用模态框交互来新增和编辑用户信息的功能。

```tsx
// add-user-dialog.tsx

import { useState } from 'react'
import { PromiseRefProps } from 'promise-ref'

export interface UserItem {
  name: string
  age: number
}

/**
 * props 参数必须继承 PromiseRefProps 类型
 */
interface Props extends PromiseRefProps<UserItem> {
  user?: UserItem // 传入 user 参数即视为编辑模式
}

export default function AddUserDialog (props: Props) {
  const [formData, setFormData] = useState<UserItem>({
    name: '',
    age: 0,
    ...props.user, // 如果是编辑，则填充默认值
  })

  const handleInput = (key: keyof UserItem, evt: InputEvent) => {
    setFormData({
      ...formData,
      [key]: evt.target.value,
    })
  }

  const handleCancel = () => {
    props.reject()
  }

  const handleSubmit = () => {
    if (formData.name && formData.age) {
      props.resolve(formData)
    } else {
      alert('表单验证失败！')
    }
  }

  return (
    <dialog>
      <form>
        <input value={formData.name} onInput={(evt) => handleInput('name', evt)} type="text"/>
        <input value={formData.age} onInput={(evt) => handleInput('age', evt)} type="number" min={0}/>
      </form>

      <div>
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </dialog>
  )
}
```

```tsx
// user-list.tsx

import { useState } from 'react'
import { usePromiseRef } from 'promise-ref'
import { AddUserDialog, UserItem } from './add-user-dialog.tsx'

export default function Home () {
  const [userList, setUserList] = useState<UserItem[]>([])

  /**
   * 1. 创建引用实例
   */
  const AddUserDialogRef = uesPromiseRef(AddUserDialog)

  const handleAdd = async () => {
    /**
     * 3.1. 调用组件
     */
    const newUser = await AddUserDialogRef.render()
    setUserList([...userList, newUser])
  }

  const handleEdit = async (item: UserItem, editIndex: number) => {
    /**
     * 3.2. 调用组件，并传入参数（编辑模式）
     */
    const newUser = await AddUserDialogRef.render({
      user: item,
    })
    setUserList((prevUserList) => {
      return prevUserList.map((userItem, index) => {
        return index === editIndex ? newUser : userItem
      })
    })
  }

  return (
    <>
      <ul>
        {
          userList.map((item, index) => (
            <li>
              <div>Name: {item.name}, Age: {item.age}</div>
              <button onClick={() => handleEdit(item, index)}>Edit</button>
            </li>
          ))
        }
      </ul>

      <button onClick={handleAdd}>Add</button>

      {
        /** 2. 组件渲染插槽（必须） */
        <AddUserDialogRef.Slot/>
      }
    </>
  )
}
```

好了，我们已经完成了一个用户列表功能的开发。根据以上的示例，我们可以得到一些总结：

+ 没有模态框的 `开/关` 变量
+ 没有模态框 `取消/确认` 的事件监听器
+ 没有用于区分 `新增/编辑` 模式的变量
+ 使用 `新增/编辑` 功能时，程序逻辑各自独立，互不干扰
+ 程序逻辑简单清晰明了，有非常高的可读性和维护性

当然你可能认为是这个示例过于简单，但其实原理是一样的，不管多么复杂的功能，只要符合异步输入输出的场景，这种模式都能为你提供更友好的开发体验和更好的程序性能。我们不必关心组件渲染状态，而专注于业务逻辑，这就是
PromiseRef 的意义。
