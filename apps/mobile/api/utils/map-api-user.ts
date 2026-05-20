import type { SessionUser } from '@/context/user/types';

/** Maps API user envelope into context session shape. */
export function mapApiUserToContext(
    payload: Record<string, unknown>,
): NonNullable<SessionUser> {
    return {
        id: String(payload.id ?? ''),
        email: String(payload.email ?? ''),
        firstName: String(payload.firstName ?? ''),
        lastName: String(payload.lastName ?? ''),
        userType: payload.userType,
        isActive: payload.isActive,
        isAdmin: payload.isAdmin,
        isSuper: payload.isSuper,
        isLocked: payload.isLocked,
        roles: payload.roles,
        status: payload.status,
        onboard: payload.onboard,
        avatar: payload.avatar,
        phoneNumber: payload.phoneNumber,
    };
}
