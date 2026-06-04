declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /** Troott API origin, e.g. http://localhost:5025 (no /api suffix). */
            EXPO_PUBLIC_TROOTT_API_URL?: string;
            /** Alias for {@link EXPO_PUBLIC_TROOTT_API_URL}. */
            EXPO_PUBLIC_API_URL?: string;
        }
    }
}

declare module '*.svg' {
    import React from 'react';
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
}

declare module '*.png';
declare module '*.jpeg';
declare module '*.jpg';
declare module '*.mp3';
declare module '*.mp4';
