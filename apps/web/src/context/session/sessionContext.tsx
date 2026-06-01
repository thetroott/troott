import { createContext } from 'react';

export interface SessionContextValue {
    isHydratingSession: boolean;
    refreshSession: (options?: { force?: boolean }) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export default SessionContext;
