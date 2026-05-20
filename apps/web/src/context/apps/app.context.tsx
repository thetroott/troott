import type { ReactNode } from 'react';

import UserState from '@/context/user/userState';

/** Top-level shell: global user context (session + sidebar slice). */
export function AppProvider({ children }: { children: ReactNode }) {
    return <UserState>{children}</UserState>;
}
