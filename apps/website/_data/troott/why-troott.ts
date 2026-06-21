import { siteConfig } from '@/app/siteConfig';

export type WhyTroottTabId =
    | 'listen'
    | 'studio'
    | 'share'
    | 'churches'
    | 'reach'
    | 'protect';

export type WhyTroottIconId =
    | 'headphone'
    | 'upload'
    | 'share'
    | 'building';

export type WhyTroottTab = {
    id: WhyTroottTabId;
    navLabel: string;
    icon: WhyTroottIconId;
    eyebrow: string;
    title: string;
    description: string;
    cta: {
        label: string;
        href?: string;
        external?: boolean;
        useGetTroott?: boolean;
    };
    image: { src: string; alt: string };
};

export type WhyTroottContent = {
    label: string;
    heading: string;
    headingMuted: string;
    subtitle?: string;
    defaultTabId: WhyTroottTabId;
    tabs: WhyTroottTab[];
};

export type ProductWorkflowsContent = {
    label: string;
    heading: string;
    subtitle: string;
    defaultTabId: WhyTroottTabId;
    tabs: WhyTroottTab[];
};

export const whyTroottContent: WhyTroottContent = {
    label: '// Why Troott',
    heading: 'Stay rooted in God\u2019s Word.',
    headingMuted: 'Wherever you are.',
    defaultTabId: 'listen',
    tabs: [
        {
            id: 'listen',
            navLabel: 'Troott App',
            icon: 'headphone',
            eyebrow: 'Troott App',
            title: 'Your sermon library, organised',
            description:
                'Every message you love in one place. Stream ad-free, pick up where you left off, and stop juggling downloads and random links.',
            cta: { label: 'Get the app', useGetTroott: true },
            image: {
                src: '/blocks/sermons.svg',
                alt: 'Troott app sermon library',
            },
        },
        {
            id: 'studio',
            navLabel: 'Troott Studio',
            icon: 'upload',
            eyebrow: 'Troott Studio',
            title: 'Upload once. Reach everywhere.',
            description:
                'Ministers publish from Studio. Troott handles processing, hosting, and delivery so listeners get a clean, official home for your messages.',
            cta: {
                label: 'Open Studio',
                href: siteConfig.baseLinks.studio,
                external: true,
            },
            image: {
                src: '/blocks/upload.svg',
                alt: 'Troott Studio for ministers',
            },
        },
        {
            id: 'share',
            navLabel: 'Share & grow',
            icon: 'share',
            eyebrow: 'Share & grow',
            title: 'Share teachings in one tap',
            description:
                'Send a sermon to family, your small group, or a friend — without leaving the app. Grow together through shared listening.',
            cta: {
                label: 'Start listening',
                href: siteConfig.baseLinks.listeners,
            },
            image: {
                src: '/blocks/profile.svg',
                alt: 'Troott mobile sharing experience',
            },
        },
        {
            id: 'churches',
            navLabel: 'For churches',
            icon: 'building',
            eyebrow: 'For churches',
            title: 'One app for your whole church',
            description:
                'Give every minister a library and every listener one place to follow, save, and return. Troott keeps your church\u2019s messages organised and easy to share.',
            cta: {
                label: 'For ministers',
                href: siteConfig.baseLinks.ministers,
            },
            image: {
                src: '/blocks/analytics.svg',
                alt: 'Troott for churches and ministries',
            },
        },
    ],
};

export const productWorkflowsContent: ProductWorkflowsContent = {
    label: 'WHY TROOTT',
    heading: 'Workflows that feel native.',
    subtitle:
        'Switch between listening, publishing, and sharing without leaving Troott.',
    defaultTabId: whyTroottContent.defaultTabId,
    tabs: whyTroottContent.tabs,
};
