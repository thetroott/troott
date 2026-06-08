import { siteConfig } from '@/app/siteConfig';

import type { SplitDemoSectionProps } from '@/components/containers/split-demo/types';

export const getStartedContent: SplitDemoSectionProps = {
    label: 'GET STARTED',
    heading: 'See why listeners and ministers choose Troott',
    description: 'Open Troott Studio to publish and manage your sermons.',
    cta: {
        label: 'Open Studio',
        href: siteConfig.baseLinks.studio,
        external: true,
    },
    image: {
        src: '/images/website-prop.png',
        alt: 'Troott Studio dashboard preview',
    },
};
