import { siteConfig } from '@/app/siteConfig';

import type {
    ProductWorkflowsContent,
    WhyTroottContent,
    WhyTroottTab,
} from './why-troott';

const requestDemoCta = siteConfig.baseLinks.requestDemo.startsWith('http')
    ? {
          label: 'Request demo',
          href: siteConfig.baseLinks.requestDemo,
          external: true as const,
      }
    : {
          label: 'Contact Sales',
          href: 'mailto:hello@troott.com',
      };

const troottAppTab: WhyTroottTab = {
    id: 'listen',
    navLabel: 'Troott App',
    icon: 'headphone',
    eyebrow: 'Troott App',
    title: 'Your sermon library, organized',
    description:
        'Every message you love in one place. Find ministers, pick up where you left off, and listen without ads or clutter. You\u2019ll be able to listen to sermons, podcasts, and more.',
    cta: { label: 'Get the app', useGetTroott: true },
    image: {
        src: '/blocks/sermons.svg',
        alt: 'Troott app preview showing sermon library',
    },
};

const ministerWhyTroottTabs: WhyTroottTab[] = [
    troottAppTab,
    {
        id: 'studio',
        navLabel: 'Troott Studio',
        icon: 'upload',
        eyebrow: 'Troott Studio',
        title: 'Your sermon library, managed',
        description:
            'Upload audio, organise series, and keep every message in one place. Troott Studio is built for ministers who want to reach more people without turning into full-time content managers.',
        cta: {
            label: 'Upload sermons',
            href: siteConfig.baseLinks.studio,
            external: true,
        },
        image: {
            src: '/blocks/upload.svg',
            alt: 'Troott Studio upload and library',
        },
    },
    {
        id: 'protect',
        navLabel: 'Protect your work',
        icon: 'share',
        eyebrow: 'Protect your work',
        title: 'Less piracy. More credit.',
        description:
            'Sermons get passed around with no name and no link back to you. Troott gives your ministry an official home so listeners know where the real message lives.',
        cta: {
            label: 'Upload sermons',
            href: siteConfig.baseLinks.studio,
            external: true,
        },
        image: {
            src: '/blocks/profile.svg',
            alt: 'Official ministry profile on Troott',
        },
    },
    {
        id: 'churches',
        navLabel: 'For churches',
        icon: 'building',
        eyebrow: 'For churches',
        title: 'One library for your whole church',
        description:
            'Give every minister a home for their messages and every member one app to grow together. Keep your church teachings organised and easy to share.',
        cta: requestDemoCta,
        image: {
            src: '/blocks/analytics.svg',
            alt: 'Troott for churches and ministries',
        },
    },
];

const ministerProductWorkflowsTabs: WhyTroottTab[] = [
    {
        id: 'studio',
        navLabel: 'Troott Studio',
        icon: 'upload',
        eyebrow: 'Troott Studio',
        title: 'Your sermon library, managed',
        description:
            'Upload audio, organise series, and keep every message in one place. Troott Studio is built for ministers who want to reach more people without turning into full-time content managers.',
        cta: {
            label: 'Upload sermons',
            href: siteConfig.baseLinks.studio,
            external: true,
        },
        image: {
            src: '/blocks/upload.svg',
            alt: 'Troott Studio upload and library',
        },
    },
    {
        id: 'reach',
        navLabel: 'Reach listeners',
        icon: 'headphone',
        eyebrow: 'Reach listeners',
        title: 'People can finally find you',
        description:
            'Listeners follow ministers they trust. When your sermons are on Troott, people pick up where they left off, save teachings, and share them with family — with your name attached.',
        cta: {
            label: 'See the listener app',
            href: siteConfig.baseLinks.listeners,
        },
        image: {
            src: '/blocks/sermons.svg',
            alt: 'Listeners finding and following ministers on Troott',
        },
    },
    {
        id: 'protect',
        navLabel: 'Protect your work',
        icon: 'share',
        eyebrow: 'Protect your work',
        title: 'Less piracy. More credit.',
        description:
            'Sermons get passed around with no name and no link back to you. Troott gives your ministry an official home so listeners know where the real message lives.',
        cta: {
            label: 'Upload sermons',
            href: siteConfig.baseLinks.studio,
            external: true,
        },
        image: {
            src: '/blocks/profile.svg',
            alt: 'Official ministry profile on Troott',
        },
    },
    {
        id: 'churches',
        navLabel: 'For churches',
        icon: 'building',
        eyebrow: 'For churches',
        title: 'One library for your whole church',
        description:
            'Give every minister a home for their messages and every member one app to grow together. Keep your church teachings organised and easy to share.',
        cta: requestDemoCta,
        image: {
            src: '/blocks/analytics.svg',
            alt: 'Troott for churches and ministries',
        },
    },
];

export const ministerWhyTroottContent: WhyTroottContent = {
    label: '// Why Troott',
    heading: 'Publish with confidence.',
    headingMuted: 'Disciple at scale.',
    defaultTabId: 'listen',
    tabs: ministerWhyTroottTabs,
};

export const ministerProductWorkflowsContent: ProductWorkflowsContent = {
    label: 'WHY TROOTT',
    heading: 'From upload to listener.',
    subtitle:
        'A workflow that fits how ministers already work — preach, upload, reach.',
    defaultTabId: 'studio',
    tabs: ministerProductWorkflowsTabs,
};
