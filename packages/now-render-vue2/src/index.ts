// /**
//  * vue: ^2.7
//  */
//
// import Vue, { h, onBeforeUnmount } from 'vue'
// import type { Component, ComponentOptions } from 'vue'
//
// interface Options {
//   root?: HTMLElement | null // 挂载的根结点元素，为 null 则不自动挂载，默认为 <body>
// }
//
// let initOptions: ComponentOptions<any> | null = null
//
// export function initRenderComponent (options: ComponentOptions<any>) {
//   initOptions = options
// }
//
// export function renderComponent (component: Component, props?: object, options?: Options) {
//   const app = new Vue({
//     ...initOptions,
//     render: () => h(component, props),
//     destroyed: () => {
//       container.parentNode?.removeChild(container)
//     }
//   })
//
//   app.$mount()
//
//   const container = app.$el
//   const root = options?.root
//
//   if (root !== null) {
//     (root || document.body).appendChild(container)
//   }
//
//   return app
// }
//
// export function useComponent (component: Component, options?: Options) {
//   const appList: Vue[] = []
//
//   const remove = (app: Vue) => {
//     const index = appList.indexOf(app)
//     if (index >= 0) {
//       appList.splice(index, 1)
//     }
//   }
//
//   onBeforeUnmount(() => {
//     for (const app of appList) {
//       app.$destroy()
//     }
//   })
//
//   return (props?: object, on?: object) => {
//     return new Promise((resolve) => {
//       const app = renderComponent(component, {
//         props,
//         on: {
//           ...on,
//           resolve: (value?: any) => {
//             resolve(value)
//             app.$destroy()
//             remove(app)
//           }
//         }
//       }, options)
//
//       appList.push(app)
//     })
//   }
// }

export default {};