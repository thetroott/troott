declare namespace NodeJS {
    interface ProcessEnv {
        readonly NEXT_PUBLIC_APP_API_URL?: string;
        readonly NEXT_PUBLIC_APP_ENVIRONMENT?: string;
        readonly MAILERLITE_API_KEY?: string;
        readonly MAILERLITE_GROUP_ID?: string;
    }
}

export {};
