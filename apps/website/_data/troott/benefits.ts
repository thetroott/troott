import type { RemixiconComponentType } from '@remixicon/react';
import {
    RiBookOpenLine,
    RiFlashlightLine,
    RiHeadphoneLine,
    RiLockLine,
    RiShareForwardLine,
    RiSmartphoneLine,
} from '@remixicon/react';

export type BenefitIconId =
    | 'library'
    | 'everywhere'
    | 'private'
    | 'instant'
    | 'background'
    | 'share';

export type BenefitItem = {
    id: BenefitIconId;
    icon: RemixiconComponentType;
    title: string;
    description: string;
};

export type BenefitsContent = {
    id: string;
    label: string;
    heading: string;
    headingMuted: string;
    items: BenefitItem[];
};

export const benefitsContent: BenefitsContent = {
    id: 'benefits',
    label: '// Benefits',
    heading: 'Listen anywhere.',
    headingMuted: 'Share with confidence.',
    items: [
        {
            id: 'library',
            icon: RiBookOpenLine,
            title: 'Every sermon in one place',
            description:
                'Find teachings from ministers you follow — organized, searchable, always available.',
        },
        {
            id: 'everywhere',
            icon: RiSmartphoneLine,
            title: 'Works on mobile and web',
            description:
                'Start on your phone, pick up in the browser. One account, every device.',
        },
        {
            id: 'private',
            icon: RiLockLine,
            title: 'Your uploads stay private',
            description:
                'Drafts and unpublished sermons stay in your studio until you are ready to share.',
        },
        {
            id: 'instant',
            icon: RiFlashlightLine,
            title: 'Instant playback',
            description:
                'Stream sermons without long waits — optimized audio delivery from upload to listen.',
        },
        {
            id: 'background',
            icon: RiHeadphoneLine,
            title: 'Listen in the background',
            description:
                'Keep listening while you use other apps — built for commutes, walks, and daily devotion.',
        },
        {
            id: 'share',
            icon: RiShareForwardLine,
            title: 'Share with one link',
            description:
                'Send a sermon to family or your congregation with a link that works everywhere.',
        },
    ],
};
