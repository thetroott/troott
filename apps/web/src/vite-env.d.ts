/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** API origin (e.g. http://localhost:3000); `/api/v1` is appended in `api/config.tsx`. */
    readonly VITE_APP_API_URL?: string;
    /** In `vite` dev, set to `"true"` to call the real sermon start-upload instead of the UI mock. */
    readonly VITE_USE_REAL_API_UPLOAD?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
