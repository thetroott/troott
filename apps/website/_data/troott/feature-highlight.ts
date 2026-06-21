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
    eyebrow: 'Personalised listening',
    heading: 'Built around you, from day one',
    description:
        'Follow the ministers you trust, save sermons, and pick up where you left off — without ads getting in the way.',
    bullets: [
        'Follow ministers and topics you care about',
        'Save messages to revisit anytime',
        'Resume playback across devices',
    ],
    screenshot: {
        src: '/mobile/lib-grid.svg',
        alt: 'Troott mobile app',
        width: 520,
        height: 880,
    },
};

export const featureHighlightStudioContent: FeatureHighlightContent = {
    id: 'feature-highlight-studio',
    eyebrow: 'Troott Studio',
    heading: 'Publish sermons without the busywork',
    description:
        'Upload once from Studio and Troott handles processing, hosting, and delivery to listeners on mobile and web.',
    bullets: [
        'Simple upload and metadata editing',
        'Organised sermon library for your ministry',
        'Reach listeners wherever they are',
    ],
    screenshot: {
        src: '/mobile/library.svg',
        alt: 'Troott Studio dashboard',
        width: 640,
        height: 480,
    },
};

export const listenerFeatureHighlightDiscoverContent: FeatureHighlightContent = {
    id: 'listener-feature-discover',
    eyebrow: 'Discover',
    heading: 'Find teachings worth your time',
    description:
        'Follow ministers and explore teachings by topic — old favourites and new releases in one place.',
    bullets: [
        'Follow ministers you trust',
        'Browse sermons by topic and theme',
        'Old favourites and new releases together',
    ],
    screenshot: {
        src: '/mobile/lib-grid.svg',
        alt: 'Discover sermons in the Troott app',
        width: 520,
        height: 880,
    },
};

export const listenerFeatureHighlightListenContent: FeatureHighlightContent = {
    id: 'listener-feature-listen',
    eyebrow: 'Listen anywhere',
    heading: 'Your sermons, on every device',
    description:
        'Stream or download on iOS and Android. Pick up where you left off across devices.',
    bullets: [
        'Stream on iOS and Android',
        'Download for offline listening',
        'Resume playback across devices',
    ],
    screenshot: {
        src: '/mobile/list.png',
        alt: 'Listen to sermons on Troott mobile',
        width: 520,
        height: 880,
    },
};

export const listenerFeatureHighlightShareContent: FeatureHighlightContent = {
    id: 'listener-feature-share',
    eyebrow: 'Share easily',
    heading: 'Pass it on in one tap',
    description:
        'Send a sermon to family or your small group without leaving the app.',
    bullets: [
        'Share a sermon link instantly',
        'Send to family or your small group',
        'Stay in the app while you share',
    ],
    screenshot: {
        src: '/mobile/search-card.svg',
        alt: 'Share a sermon from the Troott app',
        width: 520,
        height: 880,
    },
};

export const listenerFeatureHighlightSeriesContent: FeatureHighlightContent = {
    id: 'listener-feature-series',
    eyebrow: 'Series',
    heading: 'Explore series and sermons',
    description:
        'Explore series and sermons by topic — old favourites and new releases in one place.',
    bullets: [
        'Explore series and sermons by topic',
        'Old favourites and new releases together',
        'Search for sermons by topic',
    ],
    screenshot: {
        src: '/mobile/play.svg',
        alt: 'Discover sermons in the Troott app',
        width: 520,
        height: 880,
    },
};
