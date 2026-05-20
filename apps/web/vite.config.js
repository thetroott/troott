import { defineConfig } from 'vite';
import path from 'path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
const __dirnameRoot = path.dirname(fileURLToPath(import.meta.url));
const pkgVersion = JSON.parse(readFileSync(path.join(__dirnameRoot, 'package.json'), 'utf-8'));
const appVersion = pkgVersion.version ?? '0.0.0';
// https://vite.dev/config/
export default defineConfig({
    define: {
        /** Prefer this in app code — Vite replaces the whole `import.meta.env.*` access reliably. */
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            '@': path.resolve(__dirnameRoot, 'src'),
        },
    },
});
