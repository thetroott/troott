declare namespace NodeJS {
    interface ProcessEnv {
        readonly NEXT_PUBLIC_SITE_URL?: string;
        readonly NEXT_PUBLIC_APP_API_URL?: string;
        readonly NEXT_PUBLIC_APP_ENVIRONMENT?: string;
        readonly NEXT_PUBLIC_WEB_APP_URL?: string;
        readonly NEXT_PUBLIC_GET_TROOTT_PATH?: string;
        readonly NEXT_PUBLIC_GET_TROOTT_ENABLED?: string;
        readonly NEXT_PUBLIC_REQUEST_DEMO_URL?: string;
        readonly MAILERLITE_API_KEY?: string;
        readonly MAILERLITE_GROUP_ID?: string;
    }
}

export {};
