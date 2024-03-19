module.exports = {
  extends: [
    'plugin:vue/recommended',
  ],
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  rules: {
    // vue 的 defineProps, defineEmits 排序
    'vue/define-macros-order': ['error'],

    // vue 组件使用标签名规范（短横线，更符合 html 规范）
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      {
        registeredComponentsOnly: false,
        // ignores: ['router-view', 'router-link', 'component', '/^el-/'], // 因为存在 element-ui 框架，所以暂时允许这类组件，后续将移除
      },
    ],

    // slot 使用风格规范（全部缩写）
    'vue/v-slot-style': [
      'error',
      {
        atComponent: 'shorthand',
        default: 'shorthand',
        named: 'shorthand',
      },
    ],

    'vue/valid-v-slot': 'off',

    // 'vue/block-tag-newline': [
    //   'error',
    //   {
    //     singleline: 'always',
    //     multiline: 'always',
    //     maxEmptyLines: 1,
    //   },
    // ],

    // 空标签自动闭合
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],

    // 无需验证组件名
    'vue/multi-word-component-names': 'off',

    // 组件 api 风格 （先逐步展开）
    // 'vue/component-api-style': ['error'],

    // 必须使用 ts
    'vue/block-lang': [
      'error',
      {
        script: {
          lang: 'ts',
        },
      },
    ],

    // 不允许 undefined 变量 （mixins 会有问题）
    // 'vue/no-undef-properties': ['error'],

    // 不允许未使用的变量
    'vue/no-unused-properties': ['error'],

    // 不允许未使用的 ref
    'vue/no-unused-refs': ['error'],

    // 代码块强制换行
    'vue/padding-line-between-blocks': ['error'],

    // 静态 class
    'vue/prefer-separate-static-class': ['error'],

    // true 值属性
    'vue/prefer-true-attribute-shorthand': ['error'],

    // for in
    'vue/v-for-delimiter-style': ['error'],
  }
}