const antfu = require('@antfu/eslint-config')

module.exports = antfu.default({
  rules: {
    'ts/consistent-type-imports': 'off',
  },
})
