import { useSession } from '@/context/session/sessionState';
import { useWebPortalEligibility } from '@/hooks/app/useUser';

/**
 * True while portal gating may defer outlet content (session hydrate or cookie role pending).
 * Must not block DashboardLayout / AppSidebar mount (feat-0036).
 */
export function usePortalBootstrapping(): boolean {
    const { isHydratingSession } = useSession();
    const { isHydratingUserType } = useWebPortalEligibility();
    return isHydratingSession || isHydratingUserType;
}
