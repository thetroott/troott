import type { ReactNode } from 'react';

import { TroottProviders } from '@/context/providers';

/** Top-level shell: user, minister, studio, admin, and session hydration. */
export function AppProvider({ children }: { children: ReactNode }) {
    return <TroottProviders>{children}</TroottProviders>;
}
