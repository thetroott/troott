import type { ReactNode } from 'react';

import { AppState } from './app/appState';
import { UserState } from './user/userState';

export function TroottProviders({ children }: { children: ReactNode }) {
    return (
        <UserState>
            <AppState>{children}</AppState>
        </UserState>
    );
}
