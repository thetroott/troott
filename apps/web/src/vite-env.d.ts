/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** API origin (e.g. http://localhost:3000); `/api/v1` is appended in `api/config.tsx`. */
    readonly VITE_APP_API_URL?: string;
    /** In `vite` dev, set to `"true"` to call the real sermon start-upload instead of the UI mock. */
    readonly VITE_USE_REAL_API_UPLOAD?: string;
    readonly VITE_DEPLOYMENT_REGION?: string;
    readonly VITE_PADDLE_CLIENT_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface ReoIdentity {
	username: string;
	type: 'email' | 'github' | 'linkedin' | 'gmail' | 'userID';
	firstname?: string;
	lastname?: string;
	company?: string;
	other_identities?: Array<{ username: string; type: string }>;
}

interface ReoInstance {
	init: (options: { clientID: string }) => void;
	identify: (identity: ReoIdentity) => void;
}

interface Window {
	Reo?: ReoInstance;
}
