import type { ReactNode } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import storage from '@/api/services/local-storage';
import cookieService from '@/api/services/cookies';
import { useWebPortalEligibility } from '@/hooks/app/useUser';
import { useSession } from '@/context/session/sessionState';
import type { IRoute } from '@/utils/interfaces';
import { PATH_LOGIN, PATH_UNAUTHORIZED } from './paths';
import appRoutes from './app.route';
import dashboardRoutes from './dashboard.route';
import adminRoutes from './admin.route';

function normalizeRoleToken(raw: string): string {
    const n = String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
    if (n === 'super-admin' || n === 'superadmin') {
        return 'superadmin';
    }
    return n;
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

/** Enforces `isAuth` on route rows — session required; optional `roles` allow-list. */
function AuthGate({
    children,
    roles,
}: {
    children: ReactNode;
    roles?: string[];
}) {
    const location = useLocation();
    const { userType, isHydratingUserType } = useWebPortalEligibility();
    const { isHydratingSession } = useSession();
    const hasSession = storage.checkToken() && storage.checkUserID();
    const isHydrating = isHydratingUserType || isHydratingSession;

    if (!hasSession) {
        return (
            <Navigate
                to={PATH_LOGIN}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (roles?.length && isHydrating) {
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
        return (
            <Navigate
                to={PATH_UNAUTHORIZED}
                replace
                state={{
                    message:
                        'Your account does not have permission to view this page.',
                }}
            />
        );
    }

    return <>{children}</>;
}

function wrapElement(def: IRoute, node: ReactNode | undefined): ReactNode | undefined {
    if (!node) {
        return undefined;
    }
    if (!def.isAuth) {
        return node;
    }
    return <AuthGate roles={def.roles}>{node}</AuthGate>;
}

function routeObjectsFrom(defs: IRoute[]): RouteObject[] {
    return defs.map((def) => {
        const shared = {
            element: wrapElement(def, def.element),
            ...(def.errorElement ? { errorElement: def.errorElement } : {}),
            ...(def.subroutes?.length
                ? { children: routeObjectsFrom(def.subroutes) }
                : {}),
        };

        if (def.index) {
            return { ...shared, index: true } as RouteObject;
        }

        return {
            ...shared,
            ...(def.path !== undefined ? { path: def.path } : {}),
        } satisfies RouteObject;
    });
}

const routerRoutes: RouteObject[] = [
    ...routeObjectsFrom(appRoutes),
    ...routeObjectsFrom(dashboardRoutes),
    ...routeObjectsFrom(adminRoutes),
];

const Routes = () => {
    const routing = useRoutes(routerRoutes);
    return <>{routing}</>;
};

/** Flat IRoute catalog (metadata / helpers). */
export const routeCatalog: IRoute[] = [
    ...appRoutes,
    ...dashboardRoutes,
    ...adminRoutes,
];

export default Routes;
