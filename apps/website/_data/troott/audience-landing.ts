import { siteConfig } from '@/app/siteConfig';

export type AudienceLandingCta =
    | { kind: 'get-troott'; label: string }
    | { kind: 'link'; label: string; href: string; external?: boolean };

export type AudienceLandingContent = {
    audience: 'listener' | 'minister';
    metadata: { title: string; description: string };
    eyebrow: string;
    headline: string;
    headlineMuted: string;
    subtext: string;
    primaryCta: AudienceLandingCta;
    secondaryCta?: Extract<AudienceLandingCta, { kind: 'link' }>;
    valueProps: { title: string; description: string }[];
    crossLink: {
        prefix: string;
        linkLabel: string;
        href: string;
    };
};

export const listenerLandingContent: AudienceLandingContent = {
    audience: 'listener',
    metadata: {
        title: 'Troott for Listeners | Find and listen to sermons',
        description:
            'Discover sermons from your favourite ministers. Listen ad-free on iOS and Android, save teachings, and share with friends and family.',
    },
    eyebrow: '// Listener',
    headline: 'Every sermon you love,',
    headlineMuted: 'in your pocket.',
    subtext:
        "Find powerful messages from ministers you trust. Listen anytime, share with friends and family, and stay rooted in God's Word — ad-free and organised.",
    primaryCta: { kind: 'get-troott', label: 'Get Troott' },
    secondaryCta: {
        kind: 'link',
        label: 'For ministers',
        href: '/minister',
    },
    valueProps: [
        {
            title: 'Discover',
            description:
                'Follow ministers and explore teachings by topic — old favourites and new releases in one place.',
        },
        {
            title: 'Listen anywhere',
            description:
                'Stream or download on iOS and Android. Pick up where you left off across devices.',
        },
        {
            title: 'Share easily',
            description:
                'Send a sermon to family or your small group without leaving the app.',
        },
    ],
    crossLink: {
        prefix: 'Publishing sermons?',
        linkLabel: 'Troott Studio for ministers',
        href: '/minister',
    },
};

export const ministerLandingContent: AudienceLandingContent = {
    audience: 'minister',
    metadata: {
        title: 'Troott Studio for Ministers | Publish and grow your reach',
        description:
            'Upload sermons, manage your library, and help more people hear the Gospel. Troott Studio is built for ministers, preachers, and ministry teams.',
    },
    eyebrow: '// Minister',
    headline: 'Disciple more people',
    headlineMuted: 'through your sermons.',
    subtext:
        'Reach hungry hearts ready to listen. Upload once, distribute everywhere, and build disciples — not just listeners — without algorithm noise or clutter.',
    primaryCta: {
        kind: 'link',
        label: 'Open Studio',
        href: siteConfig.baseLinks.studio,
        external: true,
    },
    secondaryCta: siteConfig.baseLinks.requestDemo.startsWith('http')
        ? {
              kind: 'link',
              label: 'Request demo',
              href: siteConfig.baseLinks.requestDemo,
              external: true,
          }
        : undefined,
    valueProps: [
        {
            title: 'Publish once',
            description:
                'Upload audio from Studio. Troott handles processing, hosting, and delivery to listeners on mobile and web.',
        },
        {
            title: 'Grow your library',
            description:
                "Organise series, update metadata, and keep your congregation's teachings in one trusted place.",
        },
        {
            title: 'Reach further',
            description:
                'Share a public profile and let listeners follow your ministry from anywhere in the world.',
        },
    ],
    crossLink: {
        prefix: 'Just want to listen?',
        linkLabel: 'Get Troott for listeners',
        href: '/listener',
    },
};
