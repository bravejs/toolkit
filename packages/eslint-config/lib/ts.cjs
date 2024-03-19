module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // 允许 any
    '@typescript-eslint/no-explicit-any': 'off',

    // 允许 empty interface
    '@typescript-eslint/no-empty-interface': 'off',

    // 允许 null 的类型断言
    '@typescript-eslint/no-non-null-assertion': 'off',

    // 运行 @ts-ignore
    '@typescript-eslint/ban-ts-comment': 'off',

    // 允许在使用 declare 的情况下使用 namespace
    '@typescript-eslint/no-namespace': [
      'error',
      {
        allowDeclarations: true,
      },
    ],

  },
}