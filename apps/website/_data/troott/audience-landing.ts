import { siteConfig } from '@/app/siteConfig';

export type AudienceLandingCta =
    | { kind: 'get-troott'; label: string }
    | { kind: 'link'; label: string; href: string; external?: boolean };

export type HeroSectionContent = {
    audience: 'listener' | 'minister';
    headline: string;
    headlineMuted: string;
    subtext: string;
    primaryCta: AudienceLandingCta;
    secondaryCta?: Extract<AudienceLandingCta, { kind: 'link' }>;
    heroImage: { src: string; alt: string };
    primaryCtaIcon?: 'upload';
    secondaryCtaIcon?: 'upload';
};

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
        title: 'Listeners | Find and listen to sermons',
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
        title: 'Ministers | Publish and distribute your sermons',
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
            title: 'Stop losing your sermons',
            description:
                'Your messages should not live in WhatsApp forwards and random uploads. Troott gives every sermon a proper home — with your name, your ministry, and a link you can trust.',
        },
        {
            title: 'Upload once, we handle the rest',
            description:
                'Upload audio from Studio. Troott processes it, hosts it, and delivers it to listeners on mobile and web. You preach. We take care of the tech.',
        },
        {
            title: 'Reach people who are ready to listen',
            description:
                'Listeners are already searching for voices they trust. Share your profile, build your library, and let hungry hearts follow you — without fighting an algorithm.',
        },
    ],
    crossLink: {
        prefix: 'Just want to listen?',
        linkLabel: 'Get Troott for listeners',
        href: '/listener',
    },
};

export const listenerHeroContent: HeroSectionContent = {
    audience: 'listener',
    headline: 'Every sermon you love,',
    headlineMuted: 'in your pocket.',
    subtext:
        "Find powerful messages from ministers you trust. Listen anytime, share with friends and family, and stay rooted in God's Word — ad-free and organised.",
    primaryCta: { kind: 'get-troott', label: 'Start listening' },
    secondaryCta: {
        kind: 'link',
        label: 'Upload sermons',
        href: siteConfig.baseLinks.ministers,
    },
    secondaryCtaIcon: 'upload',
    heroImage: {
        src: '/images/hero-listener.png',
        alt: 'A preview of Troott for listeners',
    },
};

export const homeHeroContent: HeroSectionContent = {
    audience: 'listener',
    headline: 'All the sermons and teachings',
    headlineMuted: 'you love, in one place.',
    subtext:
        'Find powerful messages from your favourite ministers. Listen anytime, share with friends and family, and stay rooted in God\u2019s Word.',
    primaryCta: { kind: 'get-troott', label: 'Start listening' },
    secondaryCta: {
        kind: 'link',
        label: 'Upload sermons',
        href: siteConfig.baseLinks.ministers,
    },
    secondaryCtaIcon: 'upload',
    heroImage: {
        src: '/images/hero-image.png',
        alt: 'Troott mobile app preview',
    },
};

export const ministerHeroContent: HeroSectionContent = {
    audience: 'minister',
    headline: 'Disciple more people',
    headlineMuted: 'through your sermons.',
    subtext:
        'Most pastors give their sermons away because there is no easy way to share them. Troott is your home for life-giving messages — upload once, reach people who are already looking, and stop losing your work in random chats and reposts.',
    primaryCta: {
        kind: 'link',
        label: 'Upload sermons',
        href: siteConfig.baseLinks.studio,
        external: true,
    },
    primaryCtaIcon: 'upload',
    secondaryCta: siteConfig.baseLinks.requestDemo.startsWith('http')
        ? {
              kind: 'link',
              label: 'Request demo',
              href: siteConfig.baseLinks.requestDemo,
              external: true,
          }
        : {
              kind: 'link',
              label: 'Contact Sales',
              href: 'mailto:hello@troott.com',
          },
    heroImage: {
        src: '/blocks/upload-list.svg',
        alt: 'Troott Studio for ministers',
    },
};
