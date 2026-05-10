import { MMKV } from 'react-native-mmkv';
import { CommonActions } from '@react-navigation/native';
import {
    Troott,
    createMmkvTokenStorage,
    normalizeApiBaseUrl,
    troottAPIClient,
} from '@troott/api-client';

let navigationRef: { dispatch: (action: unknown) => void } | null = null;

export function setNavigationRef(
    ref: { dispatch: (action: unknown) => void } | null,
): void {
    navigationRef = ref;
}

function resolveApiUrl(): string {
    const raw = process.env.EXPO_PUBLIC_TROOTT_API_URL?.trim();
    if (!raw) {
        throw new Error('EXPO_PUBLIC_TROOTT_API_URL is not set');
    }
    return normalizeApiBaseUrl(raw);
}

const mmkv = new MMKV();

void new Troott(resolveApiUrl(), {
    channel: 'mobile',
    tokenStorage: createMmkvTokenStorage(mmkv, 'troott:auth:accessToken'),
    onUnauthorized: () => {
        navigationRef?.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            }),
        );
    },
});

export { troottAPIClient };
