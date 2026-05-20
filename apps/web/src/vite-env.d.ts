/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** API origin (e.g. http://localhost:3000); `/api/v1` is appended in `api/config.tsx`. */
    readonly VITE_APP_API_URL?: string;
    /** Injected in `vite.config.ts` from `package.json` `version` (build / dev). */
    readonly VITE_APP_VERSION?: string;
    /** When `"prod"`, Sentry, PostHog, and Vercel Speed Insights are enabled in `main.tsx`. */
    readonly VITE_APP_ENVIRONMENT?: string;
    readonly VITE_APP_PUBLIC_SENTRY_DSN?: string;
    readonly VITE_APP_PUBLIC_POSTHOG_KEY?: string;
    readonly VITE_APP_PUBLIC_POSTHOG_HOST?: string;
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
