import type { LogoCloudItem } from '@/_data/troott/logo-cloud';

export type PartnerGradient =
    | 'teal'
    | 'amber'
    | 'lavender'
    | 'gold'
    | 'indigo';

export type FeaturedPartner = {
    id: string;
    tag: string;
    logo: LogoCloudItem;
    gradient: PartnerGradient;
    /** Tailwind grid placement on `lg` layouts */
    gridClass: string;
};

export type FeaturedPartnersContent = {
    id: 'featured-partners';
    heading: string;
    description: string;
    partners: readonly FeaturedPartner[];
    stripLogos: readonly LogoCloudItem[];
};

export const featuredPartnersContent: FeaturedPartnersContent = {
    id: 'featured-partners',
    heading: 'Partners in ministry and technology',
    description:
        'Working with churches, creators, and teams building faithful audio experiences for listeners everywhere.',
    partners: [
        {
            id: 'damola',
            tag: 'Ministry Partner',
            logo: {
                src: '/blocks/damola-dark.svg',
                alt: 'Damola',
                invertOnDark: false,
            },
            gradient: 'teal',
            gridClass: 'lg:col-span-1',
        },
        {
            id: 'figma',
            tag: 'Design Partner',
            logo: { src: '/blocks/figma.svg', alt: 'Figma' },
            gradient: 'amber',
            gridClass: 'lg:col-span-1',
        },
        {
            id: 'mongodb',
            tag: 'Platform',
            logo: { src: '/blocks/mongodb.svg', alt: 'MongoDB' },
            gradient: 'lavender',
            gridClass: 'lg:col-span-1',
        },
        {
            id: 'react',
            tag: 'Launch Partner',
            logo: { src: '/blocks/react.svg', alt: 'React' },
            gradient: 'gold',
            gridClass: 'lg:col-span-2',
        },
        {
            id: 'notion',
            tag: 'Operations',
            logo: { src: '/blocks/notion.svg', alt: 'Notion' },
            gradient: 'indigo',
            gridClass: 'lg:col-span-1',
        },
    ],
    stripLogos: [
        { src: '/blocks/damola-dark.svg', alt: 'Damola', invertOnDark: false },
        { src: '/blocks/figma.svg', alt: 'Figma' },
        { src: '/blocks/mongodb.svg', alt: 'MongoDB' },
        { src: '/blocks/react.svg', alt: 'React' },
        { src: '/blocks/notion.svg', alt: 'Notion' },
        { src: '/blocks/typescript.svg', alt: 'TypeScript' },
    ],
} as const;
