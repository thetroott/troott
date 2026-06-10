export type FeatureHighlightContent = {
    id: string;
    eyebrow: string;
    heading: string;
    description: string;
    bullets: string[];
    screenshot: {
        src: string;
        alt: string;
        width: number;
        height: number;
    };
};

export const featureHighlightContent: FeatureHighlightContent = {
    id: 'feature-highlight',
    eyebrow: 'Personalized listening',
    heading: 'Built around you, from day one',
    description:
        'Follow the ministers you trust, save sermons, and pick up where you left off — so every recommendation feels made for you.',
    bullets: [
        'Tailored listening profile',
        'Tracks progress across sermons',
        'Gets smarter every session',
    ],
    screenshot: {
        src: '/blocks/phone-screenshot-appstore.png',
        alt: 'Troott mobile app',
        width: 520,
        height: 880,
    },
};
