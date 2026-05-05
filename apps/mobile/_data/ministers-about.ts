import type { ISermonTrack } from '@/dtos/sermon.dto';

type MinisterAboutSeed = {
    id: string;
    aliases: string[];
    description?: string;
};

const DEFAULT_MINISTER_ID = 'apostle-joshua-selman';

const MINISTER_ABOUT_SEED: MinisterAboutSeed[] = [
    {
        id: 'apostle-joshua-selman',
        aliases: ['apostle joshua selman', 'joshua selman'],
        description:
            'Apostle Joshua Selman is a Nigerian preacher and teacher known for Christ-centered teachings on intimacy with God, prayer, and spiritual growth through the Koinonia ministry.',
    },
    {
        id: 'jesudamilare-adesegun-david',
        aliases: [
            'jesudamilare adesegun-david',
            'jesudamilare adesegun david',
            'jesudamilare',
        ],
        description:
            'Jesudamilare Adesegun-David is a gospel teacher whose messages emphasize practical faith, spiritual discipline, and growth through consistent biblical application.',
    },
    {
        id: 'chris-oyakhilome',
        aliases: [
            'chris oyakhilome',
            'pastor chris oyakhilome',
            'pst. chris oyakhilome',
        ],
        description:
            'Pastor Chris Oyakhilome is a Nigerian preacher and teacher recognized globally for Christ-centered messages on faith, healing, and life in the Spirit through multiple ministry platforms.',
    },
    {
        id: 'billy-graham',
        aliases: ['billy graham'],
        description:
            'Billy Graham was an influential evangelist whose messages emphasized salvation, purpose, and wholehearted devotion to Christ across generations.',
    },
];

function normalize(label: string | null | undefined): string {
    return String(label ?? '')
        .trim()
        .toLowerCase();
}

function slugFromLabel(label: string | null | undefined): string {
    const raw = String(label ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return raw.length > 0 ? raw : DEFAULT_MINISTER_ID;
}

function topicsSummary(rows: ISermonTrack[]): string {
    const topics = Array.from(
        new Set(
            rows
                .map((r) =>
                    String((r as { topic?: unknown }).topic ?? '').trim(),
                )
                .filter((t) => t.length > 0),
        ),
    ).slice(0, 2);
    if (topics.length === 0) return '';
    return ` Popular themes include ${topics.join(' and ')}.`;
}

function findSeedByLabel(
    label: string | null | undefined,
): MinisterAboutSeed | null {
    const norm = normalize(label);
    if (!norm) return null;
    return (
        MINISTER_ABOUT_SEED.find((seed) =>
            seed.aliases.some((alias) => norm.includes(alias)),
        ) ?? null
    );
}

export function resolveMinisterIdFromLabel(
    label: string | null | undefined,
): string {
    const seed = findSeedByLabel(label);
    return seed?.id ?? slugFromLabel(label);
}

/**
 * Returns seeded minister descriptions when available; otherwise generates a
 * dummy profile summary from sermon catalog rows for the same minister label.
 */
export function resolveMinisterAbout(
    label: string | null | undefined,
    catalog: ISermonTrack[] | undefined,
): string {
    const seed = findSeedByLabel(label);
    if (seed?.description) return seed.description;

    const displayName = String(label ?? '').trim() || 'This minister';
    if (!catalog || catalog.length === 0) {
        return `${displayName} is a gospel minister featured on Troott, known for Christ-centered teachings and practical sermons for everyday faith.`;
    }

    const norm = normalize(label);
    const rows = catalog.filter((r) => {
        const minister = normalize(r.minister ?? r.artist ?? '');
        return norm.length > 0 ? minister.includes(norm) : false;
    });

    if (rows.length === 0) {
        return `${displayName} is a gospel minister featured on Troott, known for Christ-centered teachings and practical sermons for everyday faith.`;
    }

    return `${displayName} is a gospel minister on Troott with ${rows.length} available sermons.${topicsSummary(
        rows,
    )}`;
}
