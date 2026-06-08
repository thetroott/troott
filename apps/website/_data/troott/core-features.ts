import { siteConfig } from '@/app/siteConfig';

import type { CoreFeaturesSectionProps } from '@/components/containers/feature-showcase/types';

export const coreFeaturesContent: CoreFeaturesSectionProps = {
    label: '// Core features',
    heading: 'Listen with focus.',
    headingMuted: 'Share with confidence.',
    items: [
        {
            title: 'Your sermon library, organized',
            description:
                'Every message you love in one place. Find ministers, pick up where you left off, and listen without ads or clutter.',
            cta: {
                label: 'Start listening',
                href: siteConfig.baseLinks.listeners,
            },
            image: {
                src: '/images/troott-hero-image.png',
                alt: 'Troott app preview showing sermon library',
            },
            reversed: false,
        },
        {
            title: 'Share teachings in one tap',
            description:
                'Send a sermon to a friend, your small group, or family. Troott makes it easy to pass on what helped you grow.',
            cta: {
                label: 'See how it works',
                href: siteConfig.baseLinks.listeners,
            },
            image: {
                src: '/images/hero-mockup.png',
                alt: 'Troott mobile sharing experience',
            },
            reversed: true,
        },
        {
            title: 'Upload and reach listeners',
            description:
                'Ministers publish sermons from Troott Studio. Upload audio, manage your library, and help more people stay rooted in God’s Word.',
            cta: {
                label: 'Upload sermons',
                href: siteConfig.baseLinks.ministers,
            },
            image: {
                src: '/images/website-prop.png',
                alt: 'Troott Studio for ministers',
            },
            reversed: false,
            accentTop: true,
        },
    ],
};
