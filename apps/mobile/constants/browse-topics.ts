export type BrowseTopic = {
    slug: string;
    label: string;
    /** Approximate card background for tile */
    backgroundColor: string;
    /** Decorative watermark shown at top-right of the card */
    watermark: number;
    /** Figma icon group geometry for a 163.5 x 119.5 tile */
    iconBox: {
        top: number;
        right: number;
        width: number;
        height: number;
    };
};

/**
 * Figma `Browse-Categories` (4995:35775): 2 columns, 16px gaps, 12px under title.
 * Order = row-major (Healing|Prayer, Faith|Hope, …).
 */
export const BROWSE_TOPICS: BrowseTopic[] = [
    {
        slug: 'healing',
        label: 'Healing',
        backgroundColor: '#9f3865',
        watermark: require('../assets/images/topics/healing.png'),
        iconBox: { top: 12.5, right: -4.5, width: 80, height: 87.5 },
    },
    {
        slug: 'prayer',
        label: 'Prayer',
        backgroundColor: '#bc5d04',
        watermark: require('../assets/images/topics/prayer.png'),
        iconBox: { top: 11.5, right: -15, width: 90, height: 99.17 },
    },
    {
        slug: 'faith',
        label: 'Faith',
        backgroundColor: '#a86a5f',
        watermark: require('../assets/images/topics/faith.png'),
        iconBox: { top: 15.88, right: 7.5, width: 90, height: 114.55 },
    },
    {
        slug: 'hope',
        label: 'Hope',
        backgroundColor: '#5d5385',
        watermark: require('../assets/images/topics/hope.png'),
        iconBox: { top: 34, right: 8.5, width: 85, height: 85 },
    },
    {
        slug: 'marriage',
        label: 'Marriage',
        backgroundColor: '#c3204e',
        watermark: require('../assets/images/topics/marriage.png'),
        iconBox: { top: 14, right: -12, width: 82, height: 83 },
    },
    {
        slug: 'forgiveness',
        label: 'Forgiveness',
        backgroundColor: '#894b40',
        watermark: require('../assets/images/topics/forgiveness.png'),
        iconBox: { top: 23, right: -16.5, width: 90, height: 79 },
    },
    {
        slug: 'parenting',
        label: 'Parenting',
        backgroundColor: '#6b58ba',
        watermark: require('../assets/images/topics/parenting.png'),
        iconBox: { top: 13.11, right: -4.5, width: 75, height: 71.36 },
    },
    {
        slug: 'breakthrough',
        label: 'Breakthrough',
        backgroundColor: '#ad390f',
        watermark: require('../assets/images/topics/breakthrough.png'),
        iconBox: { top: 16.5, right: 0.67, width: 65.33, height: 66.73 },
    },
    {
        slug: 'worship',
        label: 'Worship',
        backgroundColor: '#894085',
        watermark: require('../assets/images/topics/worship.png'),
        iconBox: { top: 15, right: -3.5, width: 70, height: 89.59 },
    },
    {
        slug: 'obedience',
        label: 'Obedience',
        backgroundColor: '#543cf0',
        watermark: require('../assets/images/topics/obedience.png'),
        iconBox: { top: 17, right: -7.5, width: 73, height: 75 },
    },
    {
        slug: 'grace',
        label: 'Grace',
        backgroundColor: '#4a3799',
        watermark: require('../assets/images/topics/grace.png'),
        iconBox: { top: 14.05, right: -3.5, width: 80, height: 78.76 },
    },
    {
        slug: 'finances',
        label: 'Finances',
        backgroundColor: '#ea1a55',
        watermark: require('../assets/images/topics/finances.png'),
        iconBox: { top: 18, right: -5.5, width: 75, height: 79 },
    },
    {
        slug: 'temptation',
        label: 'Temptation',
        backgroundColor: '#894041',
        watermark: require('../assets/images/topics/temptation.png'),
        iconBox: { top: 14, right: 5.5, width: 70, height: 75 },
    },
    {
        slug: 'fear',
        label: 'Fear',
        backgroundColor: '#ac6d00',
        watermark: require('../assets/images/topics/fear.png'),
        iconBox: { top: 22, right: -3.5, width: 90, height: 82.74 },
    },
];
