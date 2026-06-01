import { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { useDiscoveryHomeQuery } from '@/api/hooks/app/useDiscovery';
import {
    ministerDocToRow,
    sermonDocToCatalogRow,
} from '@/engine/utils/library-map';
import type { ISermonTrack } from '@/api/dtos/sermon.dto';

const FALLBACK_MINISTER_IMAGE = require('@/assets/images/2.jpg');

export type SimilarMinisterRailItem = {
    id: string;
    name: string;
    image: ImageSourcePropType;
};

export type FeaturedMinisterRail = {
    id: string;
    name: string;
    image?: string;
    sermons: ISermonTrack[];
};

function docsToTracks(docs: unknown): ISermonTrack[] {
    if (!Array.isArray(docs)) return [];
    const tracks: ISermonTrack[] = [];
    for (const doc of docs) {
        const row = sermonDocToCatalogRow(doc);
        if (row?.id) {
            tracks.push(row as ISermonTrack);
        }
    }
    return tracks;
}

function ministerFromSermonDoc(doc: unknown) {
    if (doc == null || typeof doc !== 'object') return null;
    const d = doc as Record<string, unknown>;
    if (d.minister != null && typeof d.minister === 'object') {
        return ministerDocToRow(d.minister);
    }
    return null;
}

function readDocArray(root: Record<string, unknown>, key: string): unknown[] {
    const value = root[key];
    return Array.isArray(value) ? value : [];
}

function collectLegacyRailDocs(root: Record<string, unknown>): unknown[] {
    const rails = root.rails ?? root.sections;
    if (!Array.isArray(rails)) {
        const direct = root.sermons ?? root.items;
        return Array.isArray(direct) ? direct : [];
    }
    const docs: unknown[] = [];
    for (const rail of rails) {
        if (!rail || typeof rail !== 'object') continue;
        const items = (rail as Record<string, unknown>).items;
        if (Array.isArray(items)) {
            docs.push(...items);
        }
    }
    return docs;
}

function featuredMinisterFromDocs(docs: unknown[]): FeaturedMinisterRail | null {
    for (const doc of docs) {
        const minister = ministerFromSermonDoc(doc);
        if (!minister) continue;

        const sermons = docsToTracks(
            docs.filter((candidate) => {
                const m = ministerFromSermonDoc(candidate);
                return m?.id === minister.id;
            }),
        );

        return {
            id: minister.id,
            name: minister.name,
            image: minister.image,
            sermons: sermons.slice(0, 12),
        };
    }
    return null;
}

function similarMinistersFromDocs(
    docGroups: unknown[][],
    limit = 12,
): SimilarMinisterRailItem[] {
    const seen = new Set<string>();
    const out: SimilarMinisterRailItem[] = [];

    for (const docs of docGroups) {
        if (!Array.isArray(docs)) continue;
        for (const doc of docs) {
            const minister = ministerFromSermonDoc(doc);
            if (!minister || seen.has(minister.id)) continue;
            seen.add(minister.id);
            out.push({
                id: minister.id,
                name: minister.name,
                image: minister.image
                    ? { uri: minister.image }
                    : FALLBACK_MINISTER_IMAGE,
            });
            if (out.length >= limit) return out;
        }
    }

    return out;
}

function parseDiscoveryHome(data: unknown) {
    if (!data || typeof data !== 'object') {
        return {
            recentlyPublished: [] as ISermonTrack[],
            mostPlayed: [] as ISermonTrack[],
            popularRecentlyPlayed: [] as ISermonTrack[],
            featuredMinister: null as FeaturedMinisterRail | null,
            similarMinisters: [] as SimilarMinisterRailItem[],
        };
    }

    const root = data as Record<string, unknown>;
    const recentlyDocs = readDocArray(root, 'recentlyPublished');
    const mostPlayedDocs = readDocArray(root, 'mostPlayed');
    const popularDocs = readDocArray(root, 'popularRecentlyPlayed');
    const legacyDocs = collectLegacyRailDocs(root);

    const recentlyPublished =
        recentlyDocs.length > 0
            ? docsToTracks(recentlyDocs)
            : docsToTracks(legacyDocs);
    const mostPlayed =
        mostPlayedDocs.length > 0
            ? docsToTracks(mostPlayedDocs)
            : recentlyPublished;
    const popularRecentlyPlayed =
        popularDocs.length > 0
            ? docsToTracks(popularDocs)
            : recentlyPublished;

    const featuredMinister =
        featuredMinisterFromDocs(mostPlayedDocs.length > 0 ? mostPlayedDocs : legacyDocs) ??
        featuredMinisterFromDocs(recentlyDocs);

    const similarMinisters = similarMinistersFromDocs([
        mostPlayedDocs,
        popularDocs,
        recentlyDocs,
        legacyDocs,
    ]);

    return {
        recentlyPublished,
        mostPlayed,
        popularRecentlyPlayed,
        featuredMinister,
        similarMinisters,
    };
}

/**
 * Typed discovery home rails from `GET /discovery/home` (feat-0005).
 */
export function useDiscoveryHomeRails() {
    const query = useDiscoveryHomeQuery();

    const parsed = useMemo(
        () => parseDiscoveryHome(query.data),
        [query.data],
    );

    const allSermons = useMemo(() => {
        const seen = new Set<string>();
        const merged: ISermonTrack[] = [];
        for (const track of [
            ...parsed.popularRecentlyPlayed,
            ...parsed.recentlyPublished,
            ...parsed.mostPlayed,
        ]) {
            const id = track.id != null ? String(track.id) : '';
            if (!id || seen.has(id)) continue;
            seen.add(id);
            merged.push(track);
        }
        return merged;
    }, [parsed]);

    return {
        ...parsed,
        allSermons,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
}
