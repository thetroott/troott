import { siteConfig } from '@/app/siteConfig';

export type DownloadPlatformId = 'ios' | 'android' | 'web';

export type DownloadPlatform = {
    id: DownloadPlatformId;
    title: string;
    primary: {
        title: string;
        subtitle: string;
        package: 'ios' | 'android' | 'web';
    };
};

export type DownloadsContent = {
    label: string;
    heading: string;
    description: string;
    studioLink: { label: string; href: string };
    platforms: DownloadPlatform[];
};

export const downloadsContent: DownloadsContent = {
    label: 'ALL DOWNLOADS',
    heading: 'Get Troott today',
    description:
        'Listen on iPhone, Android, or in your browser.',
    studioLink: {
        label: 'Open Troott Studio',
        href: siteConfig.baseLinks.studio,
    },
    platforms: [
        {
            id: 'ios',
            title: 'iPhone & iPad',
            primary: {
                title: 'App Store',
                subtitle: 'iOS 16 or later',
                package: 'ios',
            },
        },
        {
            id: 'android',
            title: 'Android',
            primary: {
                title: 'Google Play',
                subtitle: 'Android 8 or later',
                package: 'android',
            },
        },
        {
            id: 'web',
            title: 'Web app',
            primary: {
                title: 'Open in browser',
                subtitle: 'Any modern browser',
                package: 'web',
            },
        },
    ],
};
