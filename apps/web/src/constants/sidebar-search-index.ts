import OnboardingItems from '@/_data/onboarding';
import { UserType } from '@/models/User.model';
import {
    PATH_ADMIN_PREFIX,
    PATH_GET_STARTED,
    PATH_PROFILE,
    PATH_SETTINGS,
    PATH_SEG_ADMIN_SERMONS,
    PATH_SEG_ADMIN_USERS,
    PATH_SEG_SERMONS_UPLOAD,
    PATH_SEG_SERMONS_UPLOAD_DETAILS,
    PATH_SEG_SERMONS_UPLOAD_FILE,
    PATH_SEG_SERMONS_UPLOAD_PUBLISH,
    PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
    studioUploadPath,
    type StudioUploadSegment,
} from '@/routes/paths';
import { resolveStudioTourLaunchPath } from '@/components/shared/tour/tour-steps';
import {
    BarChart3Icon,
    CloudUploadIcon,
    Home,
    KeyRound,
    LucideBookAudio,
    LucideLayoutDashboard,
    RocketIcon,
    Settings,
    TrashIcon,
    UserRound,
    UsersIcon,
    type LucideIcon,
} from 'lucide-react';
import type { SearchIndexGroup, SearchIndexItem } from '@/utils/sidebar-search.util';

const STUDIO_ROLES = [UserType.MINISTER, UserType.CREATOR, UserType.SUPER];
const ADMIN_ROLES = [UserType.ADMIN, UserType.SUPER];
const ONBOARDING_ROLES = [UserType.MINISTER, UserType.CREATOR];

function navItem(
    partial: Omit<
        SearchIndexItem,
        'kind' | 'group' | 'roles' | 'href' | 'title'
    > & {
        title: string;
        href: SearchIndexItem['href'];
        group?: SearchIndexGroup;
        roles?: UserType[];
        kind?: SearchIndexItem['kind'];
    },
): SearchIndexItem {
    return {
        kind: partial.kind ?? 'navigation',
        group: partial.group ?? 'Navigation',
        roles: partial.roles ?? STUDIO_ROLES,
        ...partial,
    };
}

const ACTION_ITEMS: SearchIndexItem[] = [
    {
        id: 'action.create-sermon',
        kind: 'action',
        group: 'Actions',
        title: 'Create sermon',
        keywords: ['upload', 'new sermon', 'add sermon', 'post'],
        icon: CloudUploadIcon,
        roles: STUDIO_ROLES,
        requiresOnboardingComplete: true,
        requiresStudioCode: true,
        action: 'create-sermon',
        href: '#',
    },
    {
        id: 'action.upload-sermon',
        kind: 'action',
        group: 'Actions',
        title: 'Upload sermon',
        keywords: ['upload', 'audio', 'file'],
        icon: CloudUploadIcon,
        roles: STUDIO_ROLES,
        requiresOnboardingComplete: true,
        requiresStudioCode: true,
        action: 'create-sermon',
        href: '#',
    },
];

const MAIN_NAV_ITEMS: SearchIndexItem[] = [
    navItem({
        id: 'nav.get-started',
        title: 'Get Started',
        keywords: ['onboarding', 'setup', 'launch', 'verify', 'checklist'],
        icon: RocketIcon,
        href: PATH_GET_STARTED,
        roles: ONBOARDING_ROLES,
        onboardingOnly: true,
    }),
    navItem({
        id: 'nav.dashboard',
        title: 'Dashboard',
        keywords: ['home', 'studio home', 'overview'],
        icon: LucideLayoutDashboard,
        href: '/dashboard',
        requiresOnboardingComplete: true,
        requiresStudioCode: true,
    }),
    navItem({
        id: 'nav.sermons',
        title: 'Sermons',
        keywords: ['my sermons', 'library', 'catalog', 'all sermons'],
        icon: LucideBookAudio,
        href: '/sermons',
        requiresOnboardingComplete: true,
        requiresStudioCode: true,
    }),
    navItem({
        id: 'nav.analytics',
        title: 'Analytics',
        keywords: ['stats', 'metrics', 'plays', 'listeners', 'insights'],
        icon: BarChart3Icon,
        href: '/analytics',
        requiresOnboardingComplete: true,
        requiresStudioCode: true,
    }),
    navItem({
        id: 'nav.bin',
        title: 'Bin',
        keywords: ['trash', 'deleted', 'recycle', 'removed'],
        icon: TrashIcon,
        href: '/bin',
        requiresOnboardingComplete: true,
        requiresStudioCode: true,
    }),
    navItem({
        id: 'nav.profile',
        title: 'Profile',
        keywords: ['public profile', 'bio', 'avatar', 'identity', 'listener view'],
        icon: UserRound,
        href: PATH_PROFILE,
        roles: [...STUDIO_ROLES, UserType.ADMIN],
    }),
    navItem({
        id: 'nav.settings',
        title: 'Settings',
        keywords: ['account', 'email', 'password', 'security', 'deactivate'],
        icon: Settings,
        href: PATH_SETTINGS,
        roles: [...STUDIO_ROLES, UserType.ADMIN],
    }),
];

const ADMIN_NAV_ITEMS: SearchIndexItem[] = [
    navItem({
        id: 'nav.admin.home',
        title: 'Admin',
        keywords: ['platform', 'admin home'],
        icon: Home,
        href: PATH_ADMIN_PREFIX,
        roles: ADMIN_ROLES,
    }),
    navItem({
        id: 'nav.admin.users',
        title: 'Users',
        keywords: ['all users', 'accounts', 'ministers', 'creators'],
        icon: UsersIcon,
        href: `${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_USERS}`,
        roles: ADMIN_ROLES,
    }),
    navItem({
        id: 'nav.admin.sermons',
        title: 'Sermons (admin)',
        keywords: ['platform sermons', 'all sermons', 'moderation'],
        icon: LucideBookAudio,
        href: `${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_SERMONS}`,
        roles: ADMIN_ROLES,
    }),
];

function buildOnboardingItems(): SearchIndexItem[] {
    const items: SearchIndexItem[] = [];

    const hubKeywords: Record<string, string[]> = {
        '1': ['kyc', 'identity', 'verification', 'documents'],
        '2': ['address', 'ministry', 'profile setup'],
        '3': ['tour', 'tutorial', 'guide', 'walkthrough'],
        '4': ['first sermon', 'launch'],
    };

    for (const hub of OnboardingItems) {
        items.push({
            id: `ob.hub.${hub.id}`,
            kind: 'onboarding',
            group: 'Get Started',
            title: hub.title,
            keywords: hubKeywords[hub.id] ?? [],
            icon: RocketIcon,
            roles: ONBOARDING_ROLES,
            onboardingOnly: true,
            href:
                hub.id === '3'
                    ? (ctx) =>
                          resolveStudioTourLaunchPath(ctx.studioCode) ??
                          `${PATH_GET_STARTED}/tour-guide`
                    : hub.id === '4'
                      ? (ctx) =>
                            ctx.studioCode
                                ? studioUploadPath(
                                      ctx.studioCode,
                                      PATH_SEG_SERMONS_UPLOAD,
                                  )
                                : null
                      : hub.action,
        });

        for (const step of hub.steps ?? []) {
            items.push({
                id: `ob.step.${hub.id}.${step.id}`,
                kind: 'onboarding',
                group: 'Get Started',
                title: step.title,
                keywords: [],
                icon: RocketIcon,
                roles: ONBOARDING_ROLES,
                onboardingOnly: true,
                href: step.action,
            });
        }
    }

    return items;
}

function buildUploadWizardItems(): SearchIndexItem[] {
    const steps: Array<{
        id: string;
        title: string;
        segment: StudioUploadSegment;
        keywords: string[];
    }> = [
        {
            id: 'file',
            title: 'Upload file',
            segment: PATH_SEG_SERMONS_UPLOAD_FILE,
            keywords: ['audio', 'progress', 'select file'],
        },
        {
            id: 'details',
            title: 'Sermon details',
            segment: PATH_SEG_SERMONS_UPLOAD_DETAILS,
            keywords: ['title', 'description', 'tags'],
        },
        {
            id: 'thumbnail',
            title: 'Thumbnail and preview',
            segment: PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
            keywords: ['cover', 'image', 'preview'],
        },
        {
            id: 'publish',
            title: 'Publish settings',
            segment: PATH_SEG_SERMONS_UPLOAD_PUBLISH,
            keywords: ['visibility', 'schedule', 'publish'],
        },
    ];

    return steps.map((step) => ({
        id: `upload.${step.id}`,
        kind: 'upload-step' as const,
        group: 'Upload wizard' as const,
        title: step.title,
        keywords: step.keywords,
        icon: CloudUploadIcon,
        roles: STUDIO_ROLES,
        requiresOnboardingComplete: true,
        requiresStudioCode: true,
        href: (ctx) =>
            ctx.studioCode
                ? studioUploadPath(ctx.studioCode, step.segment)
                : null,
    }));
}

const SETTINGS_ITEMS: SearchIndexItem[] = [
    {
        id: 'settings.profile-info',
        kind: 'settings-section',
        group: 'Settings',
        title: 'Profile information',
        keywords: ['name', 'email', 'update profile'],
        icon: Settings,
        roles: [...STUDIO_ROLES, UserType.ADMIN],
        href: PATH_SETTINGS,
    },
    {
        id: 'settings.password',
        kind: 'settings-section',
        group: 'Settings',
        title: 'Update password',
        keywords: ['change password', 'security'],
        icon: KeyRound,
        roles: [...STUDIO_ROLES, UserType.ADMIN],
        href: PATH_SETTINGS,
    },
    {
        id: 'settings.delete-account',
        kind: 'settings-section',
        group: 'Settings',
        title: 'Delete account',
        keywords: ['deactivate', 'remove account'],
        icon: TrashIcon,
        roles: [...STUDIO_ROLES, UserType.ADMIN],
        href: PATH_SETTINGS,
    },
    {
        id: 'profile.view',
        kind: 'settings-section',
        group: 'Settings',
        title: 'Edit public profile',
        keywords: ['bio', 'cover', 'avatar', 'ministry'],
        icon: UserRound,
        roles: STUDIO_ROLES,
        href: PATH_PROFILE,
    },
];

/** Static command palette index (feat-0028). */
export const SIDEBAR_SEARCH_INDEX: SearchIndexItem[] = [
    ...ACTION_ITEMS,
    ...MAIN_NAV_ITEMS,
    ...ADMIN_NAV_ITEMS,
    ...buildOnboardingItems(),
    ...buildUploadWizardItems(),
    ...SETTINGS_ITEMS,
];

export const SIDEBAR_SEARCH_GROUP_ORDER: SearchIndexGroup[] = [
    'Actions',
    'Navigation',
    'Get Started',
    'Upload wizard',
    'Settings',
];

export const SIDEBAR_SEARCH_GROUP_ORDER_WITH_SERMONS: SearchIndexGroup[] = [
    'Sermons',
    ...SIDEBAR_SEARCH_GROUP_ORDER,
];

export type { LucideIcon };
