import type { ReactNode } from 'react';
import UserState from '@/context/user/userState';
import MinisterState from '@/context/minister/ministerState';
import CreatorState from '@/context/creator/creatorState';
import StudioState from '@/context/studio/studioState';
import AdminState from '@/context/admin/adminState';
import SessionState from '@/context/session/sessionState';
import { SessionHydrator } from '@/context/session/SessionHydrator';

/** Troott web portal provider stack (user + role contexts + session bootstrap). */
export function TroottProviders({ children }: { children: ReactNode }) {
    return (
        <UserState>
            <MinisterState>
                <CreatorState>
                    <StudioState>
                        <AdminState>
                            <SessionState>
                                <SessionHydrator />
                                {children}
                            </SessionState>
                        </AdminState>
                    </StudioState>
                </CreatorState>
            </MinisterState>
        </UserState>
    );
}

export default TroottProviders;
