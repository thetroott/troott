import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { setPendingStableTargetFromUrl } from './pending-storage';

/**
 * Captures initial and runtime URLs so auth flows can resume `/sermon/:id` etc. after sign-in.
 * See specs/api/deep-links.md.
 */
export function usePendingDeepLinkBootstrap(): void {
    useEffect(() => {
        const handle = (url: string | null) => {
            if (url) {
                void setPendingStableTargetFromUrl(url);
            }
        };

        void Linking.getInitialURL().then(handle);
        const sub = Linking.addEventListener('url', (event) =>
            handle(event.url),
        );
        return () => sub.remove();
    }, []);
}
