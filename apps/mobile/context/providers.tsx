import type { ReactNode } from 'react';

import { useAuth } from '@/api/hooks/app/useAuth';
import { FavoritesHydrator } from '@/api/hooks/app/useFavorites';
import { AppState } from './app/appState';
import { AuthState } from './auth/authState';
import { UserState } from './user/userState';

function AuthRouting(): null {
    useAuth({ routing: true });
    return null;
}

export function TroottProviders({ children }: { children: ReactNode }) {
    return (
        <UserState>
            <AuthState>
                <AppState>
                    <AuthRouting />
                    <FavoritesHydrator />
                    {children}
                </AppState>
            </AuthState>
        </UserState>
    );
}
