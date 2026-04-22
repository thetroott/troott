declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EXPO_PUBLIC_TROOTT_API_URL: string;
        }
    }
}

export {};
