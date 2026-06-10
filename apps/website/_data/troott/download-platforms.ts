import {
    RiAppleFill,
    RiGooglePlayFill,
    RiPlayCircleFill,
    RiWindowsFill,
} from '@remixicon/react';
import type { RemixiconComponentType } from '@remixicon/react';

import { getTroottDownloadUrlForPlatform } from '@/lib/build-get-troott-url';
import type { Platform } from '@/lib/detect-platform';

export type DownloadCtaConfig = {
    label: string;
    href: string;
    Icon: RemixiconComponentType;
    analytics: string;
    ariaLabel: string;
};

const ICONS: Record<Platform, RemixiconComponentType> = {
    android: RiGooglePlayFill,
    ios: RiAppleFill,
    macos: RiAppleFill,
    windows: RiWindowsFill,
    unknown: RiPlayCircleFill,
};

const ANALYTICS: Record<Platform, string> = {
    android: 'downloadCtaAndroid',
    ios: 'downloadCtaIos',
    macos: 'downloadCtaDmg',
    windows: 'downloadCtaExe',
    unknown: 'downloadCtaWeb',
};

const FULL_LABELS: Record<Platform, string> = {
    android: 'Download for Android',
    ios: 'Download for iPhone',
    macos: 'Open in browser',
    windows: 'Open in browser',
    unknown: 'Get the app',
};

const ARIA_LABELS: Record<Platform, string> = {
    android: 'Download Troott for Android',
    ios: 'Download Troott for iPhone or iPad',
    macos: 'Get Troott for Mac',
    windows: 'Get Troott for Windows',
    unknown: 'Get the Troott app',
};

export function getDownloadCta(
    platform: Platform,
    labelMode: 'compact' | 'full' = 'compact',
): DownloadCtaConfig {
    return {
        label: labelMode === 'full' ? FULL_LABELS[platform] : 'Download',
        href: getTroottDownloadUrlForPlatform(platform),
        Icon: ICONS[platform],
        analytics: ANALYTICS[platform],
        ariaLabel: ARIA_LABELS[platform],
    };
}

export function getSsrDownloadCta(): DownloadCtaConfig {
    return {
        label: 'Download',
        href: getTroottDownloadUrlForPlatform('unknown'),
        Icon: RiPlayCircleFill,
        analytics: 'downloadCtaWeb',
        ariaLabel: 'Get the Troott app',
    };
}
