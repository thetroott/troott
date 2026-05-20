import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import storage from '@/api/services/local-storage';
import { useWebPortalEligibility } from '@/hooks/app/useUser';

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

function normalizeRoleToken(raw: string): string {
    return String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
}

function roleMatchesAllowList(
    allowed: readonly string[] | undefined,
    effectiveUserType: string,
): boolean {
    if (!allowed?.length) {
        return true;
    }
    const eff = normalizeRoleToken(effectiveUserType);
    return allowed.some((r) => normalizeRoleToken(String(r)) === eff);
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const location = useLocation();
    const { userType, isHydratingUserType } = useWebPortalEligibility();

    const hasSession = storage.checkToken() && storage.checkUserID();

    if (!hasSession) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
        );
    }

    if (roles?.length && isHydratingUserType) {
        return (
            <div
                className="text-muted-foreground flex min-h-[40vh] w-full items-center justify-center"
                role="status"
                aria-live="polite"
            >
                Loading…
            </div>
        );
    }

    if (roles?.length && !roleMatchesAllowList(roles, userType)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
