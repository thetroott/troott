import { nextJsConfig } from '@troott/configs/eslint/next.js'

export default [
  {
    ignores: ['node_modules/**', '.next/**'],
  },
  ...nextJsConfig,
]
