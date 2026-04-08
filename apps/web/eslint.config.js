import { config } from '@troott/configs/eslint/react-internal'

export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  ...config,
]
