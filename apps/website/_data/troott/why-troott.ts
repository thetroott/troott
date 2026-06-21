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
    heading: 'Listen with focus.',
    headingMuted: 'Share with confidence.',
    defaultTabId: 'listen',
    tabs: [
        {
            id: 'listen',
            navLabel: 'Troott App',
            icon: 'headphone',
            eyebrow: 'Troott App',
            title: 'Your sermon library, organized',
            description:
                'Every message you love in one place. Find ministers, pick up where you left off, and listen without ads or clutter. You’ll be able to listen to sermons, podcasts, and more.',
            cta: { label: 'Get the app', useGetTroott: true },
            image: {
                src: '/blocks/sermons.svg',
                alt: 'Troott app preview showing sermon library',
            },
        },
        {
            id: 'studio',
            navLabel: 'Troott Studio',
            icon: 'upload',
            eyebrow: 'Troott Studio',
            title: 'Upload and reach listeners',
            description:
                'Ministers publish sermons from Troott Studio. Upload audio, manage your library, and help more people stay rooted in God’s Word.',
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
                'Send a sermon to a friend, your small group, or family. Troott makes it easy to pass on what helped you grow.',
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
            title: 'Scale across your church',
            description:
                'Give every minister a home for their messages and every listener one app to grow together. Troott keeps your church library organized and easy to share.',
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
