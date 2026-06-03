import { config } from '@troott/configs/eslint/base.js';

export default [
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
    ...config,
];
