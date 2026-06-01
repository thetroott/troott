import { useSession } from './sessionState';

/** Hook used by SessionHydrator; same surface as useSession for bootstrap callers. */
export function useSessionHydrator() {
    return useSession();
}

export default useSessionHydrator;
