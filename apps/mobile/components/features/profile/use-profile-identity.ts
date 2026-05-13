import { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { useContextType } from '@/state/app-state';

export const DEFAULT_PROFILE_AVATAR = require('@/assets/images/4.jpg');
const DEFAULT_PROFILE_NAME = 'Tobechukwu Obi';

function resolveDisplayName(user: Record<string, unknown> | null): string {
    if (!user) return DEFAULT_PROFILE_NAME;

    const firstName =
        typeof user.firstName === 'string' ? user.firstName.trim() : '';
    const lastName =
        typeof user.lastName === 'string' ? user.lastName.trim() : '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName.length > 0) return fullName;

    const username =
        typeof user.username === 'string' ? user.username.trim() : '';
    if (username.length > 0) return username;

    const name = typeof user.name === 'string' ? user.name.trim() : '';
    if (name.length > 0) return name;

    return DEFAULT_PROFILE_NAME;
}

function resolveAvatarSource(user: Record<string, unknown> | null): ImageSourcePropType {
    if (!user) return DEFAULT_PROFILE_AVATAR;

    const avatar = user.avatar;
    if (typeof avatar === 'number') return avatar;
    if (typeof avatar === 'string' && avatar.trim().length > 0) {
        return { uri: avatar };
    }

    return DEFAULT_PROFILE_AVATAR;
}

export function useProfileIdentity() {
    const { userContext } = useContextType();
    const user = userContext.user as Record<string, unknown> | null;

    return useMemo(
        () => ({
            displayName: resolveDisplayName(user),
            avatarSource: resolveAvatarSource(user),
        }),
        [user],
    );
}
