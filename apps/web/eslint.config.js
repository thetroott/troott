import { config } from '@troott/configs/eslint/react-internal.js';

export default [
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
    ...config,
];
