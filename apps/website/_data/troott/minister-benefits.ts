import type { RemixiconComponentType } from '@remixicon/react';
import {
    RiBookOpenLine,
    RiFlashlightLine,
    RiHeartLine,
    RiShieldCheckLine,
    RiUploadCloudLine,
    RiUserLine,
} from '@remixicon/react';

import type { BenefitsContent } from './benefits';

export type MinisterBenefitIconId =
    | 'publish'
    | 'pipeline'
    | 'library'
    | 'profile'
    | 'protect'
    | 'disciple';

export type MinisterBenefitItem = {
    id: MinisterBenefitIconId;
    icon: RemixiconComponentType;
    title: string;
    description: string;
};

export const ministerBenefitsContent: BenefitsContent = {
    id: 'minister-benefits',
    label: '// Benefits',
    heading: 'Built for ministers',
    headingMuted: 'who want reach without the hassle.',
    items: [
        {
            id: 'publish',
            icon: RiUploadCloudLine,
            title: 'Publish from Studio',
            description:
                'Upload sermons from your browser. Draft, review, and publish when you are ready.',
        },
        {
            id: 'pipeline',
            icon: RiFlashlightLine,
            title: 'We process your audio',
            description:
                'Troott handles encoding and delivery. You do not need to think about file formats or hosting.',
        },
        {
            id: 'library',
            icon: RiBookOpenLine,
            title: 'Organise your whole catalogue',
            description:
                'Series, topics, dates — old sermons stay as easy to find as this Sunday\u2019s message.',
        },
        {
            id: 'profile',
            icon: RiUserLine,
            title: 'A public ministry profile',
            description:
                'One link for your church, conference, or online followers to find every teaching.',
        },
        {
            id: 'protect',
            icon: RiShieldCheckLine,
            title: 'Your name stays on your work',
            description:
                'Official uploads mean less mystery forwarding and more credited sharing.',
        },
        {
            id: 'disciple',
            icon: RiHeartLine,
            title: 'Disciple, don\u2019t just broadcast',
            description:
                'Listeners follow, save, and return. You are building people, not chasing views.',
        },
    ],
};
