import { useEffect, useRef } from 'react';
import storage from '@/api/services/local-storage';
import { useSession } from './sessionState';

/** Runs session bootstrap when a token exists (app load + after login via refreshSession). */
export function SessionHydrator() {
    const { refreshSession } = useSession();
    const bootstrappedRef = useRef(false);

    useEffect(() => {
        if (!storage.checkToken() || !storage.checkUserID()) {
            return;
        }
        if (bootstrappedRef.current) {
            return;
        }
        bootstrappedRef.current = true;
        void refreshSession();
    }, [refreshSession]);

    return null;
}

export default SessionHydrator;
