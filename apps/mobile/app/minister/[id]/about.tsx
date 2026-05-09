import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import AboutDetailsPanel from '@/components/features/minister/about-details-panel';
import ScreenView from '@/components/ui/screenview';
import { theme } from '@/constants/theme';

type AboutMeta = {
    title: string;
    bio: string;
    ministryName: string;
};

const ABOUT_BY_MINISTER: Record<string, AboutMeta> = {
    'sam-adeyemi': {
        title: 'Sam Adeyemi',
        bio: 'Pastor Sam Adeyemi is a Nigerian minister and leadership teacher known for practical, faith-based teaching that empowers growth in purpose, leadership, and personal transformation.',
        ministryName: 'Daystar Christian Centre',
    },
    'bolaji-idowu': {
        title: 'Bolaji Idowu',
        bio: 'Pastor Bolaji Idowu is a Nigerian minister and ministry leader known for clear, scripture-rooted teaching and practical discipleship that strengthens believers in everyday life.',
        ministryName: 'Harvesters International',
    },
    'chris-oyakhilome': {
        title: 'Chris Oyakhilome',
        bio: 'Pastor Chris Oyakhilome is a Nigerian minister and teacher recognized globally for Christ-centered messages on faith, healing, and life in the Spirit through multiple ministry platforms.',
        ministryName: 'LoveWorld Incorporated',
    },
};

const DEFAULT_SOCIAL_LINKS = [
    {
        id: 'instagram',
        label: 'Instagram',
        handle: '@KoinoniaMinistry',
        iconText: 'IG',
    },
    { id: 'x', label: 'X', handle: '@KoinoniaMinistry', iconText: 'X' },
    {
        id: 'tiktok',
        label: 'TikTok',
        handle: '@KoinoniaMinistry',
        iconText: 'TT',
    },
];

export default function MinisterAboutScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const key = id ?? 'sam-adeyemi';
    const meta = ABOUT_BY_MINISTER[key] ?? ABOUT_BY_MINISTER['sam-adeyemi'];

    return (
        <ScreenView
            screenStyle={{
                backgroundColor: theme.colors.grey[800],
                paddingHorizontal: 0,
            }}
        >
            <AboutDetailsPanel
                title={meta.title}
                bio={meta.bio}
                ministryName={meta.ministryName}
                socialLinks={DEFAULT_SOCIAL_LINKS}
                onPressBack={() => {
                    if (router.canGoBack()) {
                        router.back();
                        return;
                    }
                    router.replace(`/minister/${key}`);
                }}
            />
        </ScreenView>
    );
}
