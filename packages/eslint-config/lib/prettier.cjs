module.exports = {
  extends: [
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true, // 单引号，方便单键输入，无需加按 shift 键
        // semi: false, // 分号结尾，方便阅读代码，更容易感知边界
        // trailingComma: 'none', // 逗号结尾，方便在 json 对象末尾扩展新字段，而无需先输入 `,` 符号
      },
    ],
  },
}