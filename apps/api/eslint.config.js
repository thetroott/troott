import { config } from '@troott/configs/eslint/base';

export default [
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
    ...config,
];
