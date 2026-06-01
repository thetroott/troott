import { UserType } from '@/models/User.model';

export const SIDEBAR_GROUP_ADMIN = 'Admin';

type NavGroupLike = {
    title: string;
    roles?: UserType[];
};

export function isAdminSidebarGroup(group: NavGroupLike): boolean {
    return group.title === SIDEBAR_GROUP_ADMIN;
}

/** feat-0002: admin = Admin only; super = Admin + studio groups; minister/creator = studio only. */
export function isSidebarGroupVisibleForUser(
    group: NavGroupLike,
    userType: UserType,
): boolean {
    if (isAdminSidebarGroup(group)) {
        return userType === UserType.ADMIN || userType === UserType.SUPER;
    }

    if (userType === UserType.ADMIN) {
        return false;
    }

    if (
        userType === UserType.SUPER ||
        userType === UserType.MINISTER ||
        userType === UserType.CREATOR
    ) {
        return true;
    }

    return false;
}

export type SidebarNavItemLike = {
    title: string;
    url: string;
    showOnboarding?: boolean;
};

export function isHiddenNavItem(item: SidebarNavItemLike): boolean {
    return item.url === '/community';
}
