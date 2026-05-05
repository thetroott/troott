export type BrowseTopicFullTile = {
    /** Raster @2× from Figma (327px wide = 163.5pt frame); height matches PNG */
    source: number;
    widthPx: number;
    heightPx: number;
};

export type BrowseTopic = {
    slug: string;
    label: string;
    /** Solid fill under illustration (composite tiles); ignored when `fullTile` is set */
    backgroundColor: string;
    /** Decorative art for composite layout; ignored when `fullTile` is set */
    watermark?: number;
    /** Icon group vs 163.5pt-wide frame; ignored when `fullTile` is set */
    iconBox: {
        top: number;
        right: number;
        width: number;
        height: number;
    };
    /**
     * Figma frame height in pt (4995:41277 = 119.5, 4995:41266 = 120).
     * Ignored when `fullTile` is set (height comes from raster aspect).
     */
    figmaHeight: number;
    /** Full-card raster — same rendering path as Healing / Faith */
    fullTile?: BrowseTopicFullTile;
};

/**
 * Figma `Categories` (4995:35778). All topics use `fullTile` @2× (327w) so tiles match
 * Healing/Faith (bitmap fills the frame; fear/temptation padded from short exports — replace via
 * `scripts/fetch-browse-topic-cards.mjs` when you have `FIGMA_ACCESS_TOKEN`).
 */
export const BROWSE_TOPICS: BrowseTopic[] = [
    {
        slug: 'healing',
        label: 'Healing',
        backgroundColor: '#9f3865',
        watermark: require('../assets/images/topics/healing.png'),
        iconBox: { top: 12.5, right: -4.5, width: 80, height: 87.5 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/healing-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'prayer',
        label: 'Prayer',
        backgroundColor: '#bc5d04',
        watermark: require('../assets/images/topics/prayer.png'),
        iconBox: { top: 11.5, right: -15, width: 90, height: 99.17 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/prayer-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'faith',
        label: 'Faith',
        backgroundColor: '#a86a5f',
        watermark: require('../assets/images/topics/faith.png'),
        iconBox: { top: 15.88, right: 7.5, width: 90, height: 114.55 },
        figmaHeight: 120,
        fullTile: {
            source: require('../assets/images/topics/cards/faith-card.png'),
            widthPx: 327,
            heightPx: 240,
        },
    },
    {
        slug: 'hope',
        label: 'Hope',
        backgroundColor: '#5d5385',
        watermark: require('../assets/images/topics/hope.png'),
        iconBox: { top: 34, right: 8.5, width: 85, height: 85 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/hope-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'marriage',
        label: 'Marriage',
        backgroundColor: '#c3204e',
        watermark: require('../assets/images/topics/marriage.png'),
        iconBox: { top: 14, right: -12, width: 82, height: 83 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/marriage-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'forgiveness',
        label: 'Forgiveness',
        backgroundColor: '#894b40',
        watermark: require('../assets/images/topics/forgiveness.png'),
        iconBox: { top: 23, right: -16.5, width: 90, height: 79 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/forgiveness-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'parenting',
        label: 'Parenting',
        backgroundColor: '#6b58ba',
        watermark: require('../assets/images/topics/parenting.png'),
        iconBox: { top: 13.11, right: -4.5, width: 75, height: 71.36 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/parenting-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'breakthrough',
        label: 'Breakthrough',
        backgroundColor: '#ad390f',
        watermark: require('../assets/images/topics/breakthrough.png'),
        iconBox: { top: 16.5, right: 0.67, width: 65.33, height: 66.73 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/breakthrough-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'worship',
        label: 'Worship',
        backgroundColor: '#894085',
        watermark: require('../assets/images/topics/worship.png'),
        iconBox: { top: 15, right: -3.5, width: 70, height: 89.59 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/worship-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'obedience',
        label: 'Obedience',
        backgroundColor: '#543cf0',
        watermark: require('../assets/images/topics/obedience.png'),
        iconBox: { top: 17, right: -7.5, width: 73, height: 75 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/obedience-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'grace',
        label: 'Grace',
        backgroundColor: '#4a3799',
        watermark: require('../assets/images/topics/grace.png'),
        iconBox: { top: 14.05, right: -3.5, width: 80, height: 78.76 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/grace-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'finances',
        label: 'Finances',
        backgroundColor: '#ea1a55',
        watermark: require('../assets/images/topics/finances.png'),
        iconBox: { top: 18, right: -5.5, width: 75, height: 79 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/finances-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'temptation',
        label: 'Temptation',
        backgroundColor: '#894041',
        watermark: require('../assets/images/topics/temptation.png'),
        iconBox: { top: 14, right: 5.5, width: 70, height: 75 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/temptation-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
    {
        slug: 'fear',
        label: 'Fear',
        backgroundColor: '#ac6d00',
        watermark: require('../assets/images/topics/fear.png'),
        iconBox: { top: 22, right: -3.5, width: 90, height: 82.74 },
        figmaHeight: 119.5,
        fullTile: {
            source: require('../assets/images/topics/cards/fear-card.png'),
            widthPx: 327,
            heightPx: 239,
        },
    },
];

function titleCaseFromSlug(slug: string): string {
    const s = decodeURIComponent(slug).replace(/-/g, ' ');
    return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Display label for a topic route `slug` (matches Figma titles like "Faith"). */
export function getBrowseTopicLabel(slug: string | undefined): string {
    if (slug == null || slug.length === 0) {
        return 'Topic';
    }
    const key = slug.toLowerCase();
    const found = BROWSE_TOPICS.find((t) => t.slug === key);
    return found?.label ?? titleCaseFromSlug(slug);
}
