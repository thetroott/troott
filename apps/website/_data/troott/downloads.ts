import { siteConfig } from '@/app/siteConfig';

import type { DesktopDownloadTile } from '@/components/containers/downloads/types';

export type StandardDownloadPlatform = {
    id: 'ios' | 'android' | 'web';
    title: string;
    primary: {
        title: string;
        subtitle: string;
        package: 'ios' | 'android' | 'web';
    };
};

export type DesktopDownloadPlatform = {
    id: 'desktop';
    mac: {
        title: string;
        tile: DesktopDownloadTile;
        installCommand: string;
    };
    windows: {
        title: string;
        tiles: [DesktopDownloadTile, DesktopDownloadTile];
        installCommand: string;
        archOptions: [{ id: 'x64'; label: string }, { id: 'arm64'; label: string }];
    };
};

export type DownloadPlatform =
    | StandardDownloadPlatform
    | DesktopDownloadPlatform;

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
        {
            id: 'desktop',
            mac: {
                title: 'macOS',
                tile: {
                    title: '.dmg',
                    subtitle: 'Version 10.14+',
                    package: 'dmg',
                },
                installCommand: 'brew install --cask troott',
            },
            windows: {
                title: 'Windows',
                tiles: [
                    {
                        title: '.exe',
                        subtitle: 'Windows 11/10 x64',
                        package: 'exe',
                    },
                    {
                        title: '.exe',
                        subtitle: 'Windows 11/10 ARM64',
                        package: 'exe',
                    },
                ],
                installCommand: 'winget install Troott.Troott',
                archOptions: [
                    { id: 'x64', label: 'x64' },
                    { id: 'arm64', label: 'ARM64' },
                ],
            },
        },
    ],
};

export function isDesktopPlatform(
    platform: DownloadPlatform,
): platform is DesktopDownloadPlatform {
    return platform.id === 'desktop';
}
