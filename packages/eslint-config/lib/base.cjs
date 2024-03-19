const multipleStatements = [
  'block',
  'block-like',
  'multiline-block-like',
  'multiline-const',
  'multiline-let',
  'multiline-var',
  'multiline-expression',
]

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',

    // 开启结尾逗号
    'comma-dangle': 'error',

    // 开启结尾分号
    semi: 'error',

    // 遵循驼峰命名
    camelcase: 'error',

    // import 排序
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        allowSeparatedGroups: true,
      },
    ],

    // 限制空行数量
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
      },
    ],

    // 代码块换行
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always', // 多行语句之前换行
        prev: ['*'],
        next: multipleStatements,
      },
      {
        blankLine: 'always', // 多行语句之后换行
        prev: multipleStatements,
        next: ['*'],
      },
    ],

    // class 属性方法换行
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true, // 单个成员存在多行代码才换行
      },
    ],
  },
}