import { UserType } from '@/models/User.model';
import {
    isStudioScopedLegacyNavUrl,
    resolveStudioNavUrl,
} from '@/utils/studio-nav.util';
import type { LucideIcon } from 'lucide-react';

export type SearchIndexKind =
    | 'navigation'
    | 'action'
    | 'onboarding'
    | 'upload-step'
    | 'settings-section';

export type SearchIndexGroup =
    | 'Actions'
    | 'Navigation'
    | 'Get Started'
    | 'Upload wizard'
    | 'Settings'
    | 'Sermons';

export type SidebarSearchAction = 'create-sermon';

export type SidebarSearchContext = {
    userType: UserType;
    studioCode: string;
    onboardingComplete: boolean;
    showGetStarted: boolean;
};

export type SearchIndexItem = {
    id: string;
    kind: SearchIndexKind;
    title: string;
    subtitle?: string;
    keywords?: string[];
    icon?: LucideIcon;
    roles: UserType[];
    onboardingOnly?: boolean;
    requiresOnboardingComplete?: boolean;
    requiresStudioCode?: boolean;
    href: string | ((ctx: SidebarSearchContext) => string | null);
    action?: SidebarSearchAction;
    group: SearchIndexGroup;
};

export function commandValueForItem(item: SearchIndexItem): string {
    const keywords = item.keywords?.join(' ') ?? '';
    return [item.title, item.subtitle, keywords].filter(Boolean).join(' ');
}

export function isPureAdminUser(userType: UserType): boolean {
    return userType === UserType.ADMIN;
}

export function resolveSearchItemHref(
    item: SearchIndexItem,
    ctx: SidebarSearchContext,
): string | null {
    const raw =
        typeof item.href === 'function' ? item.href(ctx) : item.href;

    if (raw === '#' || !raw) {
        return null;
    }

    if (isStudioScopedLegacyNavUrl(raw)) {
        return resolveStudioNavUrl(raw, ctx.studioCode);
    }

    if (raw.startsWith('/studio/') && raw.includes('/_/')) {
        return null;
    }

    return raw;
}

export function getSearchItemDisabledReason(
    item: SearchIndexItem,
    ctx: SidebarSearchContext,
): string | null {
    if (item.action === 'create-sermon') {
        if (!ctx.onboardingComplete) {
            return 'Finish Get Started first';
        }
        if (!ctx.studioCode) {
            return 'Studio not ready';
        }
        return null;
    }

    if (item.requiresOnboardingComplete && !ctx.onboardingComplete) {
        return 'Finish Get Started first';
    }

    if (item.requiresStudioCode && !ctx.studioCode) {
        return 'Studio not ready';
    }

    const href = resolveSearchItemHref(item, ctx);
    const needsStudio =
        item.requiresStudioCode ||
        isStudioScopedLegacyNavUrl(
            typeof item.href === 'string' ? item.href : '',
        ) ||
        (typeof item.href === 'function' &&
            item.group === 'Upload wizard');

    if (needsStudio && !href) {
        return 'Studio not ready';
    }

    return null;
}

export function isSearchItemVisible(
    item: SearchIndexItem,
    ctx: SidebarSearchContext,
): boolean {
    if (!item.roles.includes(ctx.userType)) {
        return false;
    }

    if (isPureAdminUser(ctx.userType)) {
        if (
            item.group === 'Actions' ||
            item.group === 'Get Started' ||
            item.group === 'Upload wizard' ||
            item.kind === 'upload-step'
        ) {
            return false;
        }
        if (item.group === 'Settings' || item.id === 'nav.profile') {
            return item.roles.includes(UserType.ADMIN);
        }
        if (item.group === 'Navigation') {
            return item.roles.includes(UserType.ADMIN);
        }
        return false;
    }

    if (item.onboardingOnly && ctx.onboardingComplete) {
        return false;
    }

    if (item.group === 'Upload wizard' && !ctx.onboardingComplete) {
        return false;
    }

    if (item.id === 'nav.get-started' && !ctx.showGetStarted) {
        return false;
    }

    return true;
}

export function filterSearchIndex(
    index: SearchIndexItem[],
    ctx: SidebarSearchContext,
): SearchIndexItem[] {
    return index.filter((item) => isSearchItemVisible(item, ctx));
}

export function groupSearchItems(
    items: SearchIndexItem[],
): Map<SearchIndexGroup, SearchIndexItem[]> {
    const map = new Map<SearchIndexGroup, SearchIndexItem[]>();
    for (const item of items) {
        const list = map.get(item.group) ?? [];
        list.push(item);
        map.set(item.group, list);
    }
    for (const [, list] of map) {
        list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return map;
}

export function queryIncludesBinScope(query: string): boolean {
    return /\b(bin|trash)\b/i.test(query.trim());
}
