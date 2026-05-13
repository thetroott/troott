import React, { useMemo } from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    View,
    type ImageStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Heart } from 'iconsax-react-nativejs';

import { OutlineIcons } from '@/assets/icons';
import PlayListCard from '@/components/features/playlist/playlist-card';
import SermonCard from '@/components/features/search/sermon-card';
import Text from '@/components/ui/text';
import { tracks } from '@/_data/_mock/tracks';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { theme } from '@/constants/theme';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';
import {
    getLibraryArrayField,
    mapSeriesDocsToRows,
    mapSermonDocsToItems,
    ministerDocToRow,
    playlistDocToRow,
    type LibrarySeriesRow,
} from '@/engine/utils/library-map';
import {
    usePlaylistsQuery,
    useUserLibraryQuery,
} from '@/api/hooks/app/useLibrary';

import { LibraryEmptyState } from './library-states';

type DisplayStyle = 'grid' | 'list';

/** Matches pre-migration Library `AllElements` (playlist tiles + counts). */
export function LibraryAllSmartCards({
    isGrid,
    likedCount,
    ministerCount,
    playlistCount,
    downloadsCount,
    onOpenLiked,
    onOpenMinisters,
    onOpenPlaylists,
    onOpenDownloads,
}: {
    isGrid: boolean;
    likedCount: number;
    ministerCount: number;
    playlistCount: number;
    downloadsCount: number;
    onOpenLiked: () => void;
    onOpenMinisters: () => void;
    onOpenPlaylists: () => void;
    onOpenDownloads: () => void;
}) {
    const likedLabel =
        likedCount === 1 ? '1 sermon' : `${likedCount} sermons`;
    const ministerLabel =
        ministerCount === 1 ? '1 minister' : `${ministerCount} ministers`;
    const downloadsLabel =
        downloadsCount === 1 ? '1 sermon' : `${downloadsCount} sermons`;
    const playlistsLabel =
        playlistCount === 1 ? '1 playlist' : `${playlistCount} playlists`;

    return (
        <View
            style={{
                gap: theme.sizes.spacing.md,
                flexDirection: isGrid ? 'row' : 'column',
                flexWrap: isGrid ? 'wrap' : 'nowrap',
                justifyContent: isGrid ? 'space-between' : 'flex-start',
            }}
        >
            <PlayListCard
                title="Liked sermons"
                description={`Auto playlist – ${likedLabel}`}
                id="liked-sermons"
                icon={Heart}
                variant={isGrid ? 'large' : 'small'}
                onPress={onOpenLiked}
                cardStyle={{
                    width: isGrid ? theme.sizes.screen.width * 0.42 : '100%',
                }}
            />
            <PlayListCard
                title="Favorite ministers"
                description={ministerLabel}
                id="favorite-ministers"
                icon={OutlineIcons.UserPlusIcon}
                variant={isGrid ? 'large' : 'small'}
                onPress={onOpenMinisters}
                cardStyle={{
                    width: isGrid ? theme.sizes.screen.width * 0.42 : '100%',
                }}
            />
            <PlayListCard
                title="Downloads"
                description={downloadsLabel}
                id="downloads"
                icon={OutlineIcons.ArrowDownIcon}
                variant={isGrid ? 'large' : 'small'}
                onPress={onOpenDownloads}
                cardStyle={{
                    width: isGrid ? theme.sizes.screen.width * 0.42 : '100%',
                }}
            />
            <PlayListCard
                title="My playlists"
                description={playlistsLabel}
                image="https://picsum.photos/200/300"
                id="my-playlists"
                variant={isGrid ? 'large' : 'small'}
                onPress={onOpenPlaylists}
                cardStyle={{
                    width: isGrid ? theme.sizes.screen.width * 0.42 : '100%',
                }}
            />
        </View>
    );
}

/** Matches pre-migration `ListeningHistory`: {@link SermonCard} grid/list; mock rows when API has none. */
export function LibraryListeningHistory({
    displayStyle,
}: {
    displayStyle: DisplayStyle;
}) {
    const { data: lib } = useUserLibraryQuery(true);
    let raw = getLibraryArrayField(lib, 'listeningHistory');
    if (!raw.length) raw = getLibraryArrayField(lib, 'recentlyPlayed');
    const apiItems = mapSermonDocsToItems(raw);

    const previewItems: SermonItemDTO[] = useMemo(
        () =>
            [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const row = tracks[i % 3];
                return catalogRowToSermonItem({
                    ...row,
                    id:
                        row.id != null
                            ? String(row.id)
                            : `listening-preview-${i}`,
                } as Partial<ISermonTrack> & { id: string | null });
            }),
        [],
    );

    const listeningItems = apiItems.length ? apiItems : previewItems;

    const isGrid = displayStyle === 'grid';

    return (
        <View
            style={
                isGrid
                    ? {
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                      }
                    : { gap: 10 }
            }
        >
            {listeningItems.map((item, index) => (
                <View
                    key={item.id ?? `${index}-listening`}
                    style={
                        isGrid
                            ? {
                                  width: theme.sizes.screen.width * 0.44,
                                  marginBottom: 20,
                              }
                            : undefined
                    }
                >
                    <SermonCard
                        track={item}
                        index={index}
                        tracklist={listeningItems}
                        queue="Library"
                        variant={isGrid ? 'large' : 'small'}
                        cardStyle={{
                            width: isGrid
                                ? theme.sizes.screen.width * 0.44
                                : '100%',
                        }}
                    />
                </View>
            ))}
        </View>
    );
}


function sortSermons(
    items: SermonItemDTO[],
    mode: 'recent' | 'alpha' | 'oldest' | 'plays',
): SermonItemDTO[] {
    const copy = [...items];
    if (mode === 'alpha') {
        return copy.sort((a, b) =>
            String(a.title ?? '').localeCompare(String(b.title ?? '')),
        );
    }
    if (mode === 'plays') {
        return copy.sort(
            (a, b) => (b.totalPlays ?? 0) - (a.totalPlays ?? 0),
        );
    }
    if (mode === 'oldest') {
        return copy.sort((a, b) => {
            const da = Date.parse(String(a.releaseDate ?? ''));
            const db = Date.parse(String(b.releaseDate ?? ''));
            const na = Number.isNaN(da) ? 0 : da;
            const nb = Number.isNaN(db) ? 0 : db;
            return na - nb;
        });
    }
    return copy.sort((a, b) => {
        const da = Date.parse(String(a.releaseDate ?? ''));
        const db = Date.parse(String(b.releaseDate ?? ''));
        const na = Number.isNaN(da) ? 0 : da;
        const nb = Number.isNaN(db) ? 0 : db;
        return nb - na;
    });
}

export function LibrarySermonCategory({
    displayStyle,
    subCategories,
    sortMode,
}: {
    displayStyle: DisplayStyle;
    subCategories: string[];
    sortMode: 'recent' | 'alpha' | 'oldest' | 'plays';
}) {
    const { data: lib } = useUserLibraryQuery(true);
    const downloadedOnly = subCategories.includes('Downloaded');
    const liked = mapSermonDocsToItems(
        getLibraryArrayField(lib, 'likedSermons', 'likedsermons'),
    );
    const downloaded = mapSermonDocsToItems(
        getLibraryArrayField(lib, 'downloadedSermons', 'downloadedsermons'),
    );
    const base = downloadedOnly ? downloaded : liked;
    const items = sortSermons(base, sortMode);

    if (!items.length) {
        return (
            <LibraryEmptyState
                title={downloadedOnly ? 'No downloads yet' : 'No sermons yet'}
                subtitle={
                    downloadedOnly
                        ? 'Sermons you download will show here for offline listening.'
                        : 'Like sermons or explore the catalogue.'
                }
                actionLabel="Explore sermons"
                actionFilled
                onAction={() => router.push('/search')}
            />
        );
    }

    return (
        <View
            style={
                displayStyle === 'grid'
                    ? {
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          gap: theme.sizes.spacing.sm,
                      }
                    : { gap: theme.sizes.spacing.sm }
            }
        >
            {items.map((item, index) => (
                <View
                    key={item.id ?? String(index)}
                    style={
                        displayStyle === 'grid'
                            ? {
                                  width: theme.sizes.screen.width * 0.44,
                                  marginBottom: theme.sizes.spacing.md,
                              }
                            : undefined
                    }
                >
                    <SermonCard
                        track={item}
                        index={index}
                        tracklist={items}
                        queue="Library"
                        variant={displayStyle === 'list' ? 'small' : 'large'}
                        cardStyle={{
                            width:
                                displayStyle === 'list'
                                    ? '100%'
                                    : theme.sizes.screen.width * 0.44,
                        }}
                    />
                </View>
            ))}
        </View>
    );
}

function SeriesRow({ row }: { row: LibrarySeriesRow }) {
    const thumbStyle: ImageStyle = {
        width: 56,
        height: 56,
        borderRadius: theme.sizes.radius.sm,
        backgroundColor: theme.colors.grey[700],
    };
    return (
        <Pressable
            style={styles.row}
            onPress={() => router.push(`/series/${row.id}`)}
        >
            {row.image ? (
                <Image source={{ uri: row.image }} style={thumbStyle} />
            ) : (
                <View style={thumbStyle} />
            )}
            <View style={{ flex: 1 }}>
                <Text color={theme.colors.white[50]} numberOfLines={2}>
                    {row.title}
                </Text>
                {row.minister ? (
                    <Text size="sm" color={theme.colors.grey[400]} numberOfLines={1}>
                        {row.minister}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

function sortSeries(
    rows: LibrarySeriesRow[],
    mode: 'recent' | 'alpha' | 'oldest' | 'plays',
): LibrarySeriesRow[] {
    const copy = [...rows];
    if (mode === 'alpha') {
        return copy.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (mode === 'plays') {
        return copy.sort(
            (a, b) => (b.totalPlays ?? 0) - (a.totalPlays ?? 0),
        );
    }
    if (mode === 'oldest') {
        return copy.sort((a, b) => {
            const ca = a.createdAtMs ?? 0;
            const cb = b.createdAtMs ?? 0;
            return ca - cb;
        });
    }
    return copy.sort((a, b) => {
        const ua = a.updatedAtMs ?? a.createdAtMs ?? 0;
        const ub = b.updatedAtMs ?? b.createdAtMs ?? 0;
        return ub - ua;
    });
}

export function LibrarySeriesCategory({
    displayStyle: _displayStyle,
    subCategories,
    sortMode,
}: {
    displayStyle: DisplayStyle;
    subCategories: string[];
    sortMode: 'recent' | 'alpha' | 'oldest' | 'plays';
}) {
    const { data: lib } = useUserLibraryQuery(true);
    const downloadedOnly = subCategories.includes('Downloaded');
    const seriesRaw = getLibraryArrayField(
        lib,
        'followedSeries',
        'followedseries',
    );
    let rows = mapSeriesDocsToRows(seriesRaw);
    if (downloadedOnly) {
        rows = [];
    }
    rows = sortSeries(rows, sortMode);

    if (!rows.length) {
        return (
            <LibraryEmptyState
                title={
                    downloadedOnly ? 'No downloaded series' : 'No series yet'
                }
                subtitle="Follow series to see them here."
                actionLabel="Explore series"
                actionFilled
                onAction={() => router.push('/search')}
            />
        );
    }

    return (
        <View style={{ gap: theme.sizes.spacing.sm }}>
            {rows.map((row) => (
                <SeriesRow key={row.id} row={row} />
            ))}
        </View>
    );
}

function MinisterRow({
    row,
}: {
    row: { id: string; name: string; image?: string };
}) {
    const thumbStyle: ImageStyle = {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.grey[700],
    };
    return (
        <Pressable
            style={styles.row}
            onPress={() => router.push(`/minister/${row.id}`)}
        >
            {row.image ? (
                <Image source={{ uri: row.image }} style={thumbStyle} />
            ) : (
                <View style={thumbStyle} />
            )}
            <Text color={theme.colors.white[50]}>{row.name}</Text>
        </Pressable>
    );
}

function sortMinisters(
    rows: { id: string; name: string; image?: string }[],
    mode: 'alpha' | 'plays',
): { id: string; name: string; image?: string }[] {
    const copy = [...rows];
    if (mode === 'alpha') {
        return copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    return copy;
}

export function LibraryMinisterCategory({
    displayStyle: _displayStyle,
    sortMode,
}: {
    displayStyle: DisplayStyle;
    sortMode: 'alpha' | 'plays';
}) {
    const { data: lib } = useUserLibraryQuery(true);
    const raw = getLibraryArrayField(
        lib,
        'favouriteMinisters',
        'favouriteministers',
    );
    const rows = sortMinisters(
        raw
            .map((d) => ministerDocToRow(d))
            .filter((r): r is NonNullable<typeof r> => r != null),
        sortMode,
    );

    if (!rows.length) {
        return (
            <LibraryEmptyState
                title="No ministers yet"
                subtitle="Follow ministers to see them in your library."
                actionLabel="Explore ministers"
                actionFilled
                onAction={() => router.push('/search')}
            />
        );
    }

    return (
        <View style={{ gap: theme.sizes.spacing.sm }}>
            {rows.map((row) => (
                <MinisterRow key={row.id} row={row} />
            ))}
        </View>
    );
}

export function LibraryPlaylistCategory({
    displayStyle: _displayStyle,
    subCategories,
    sortValue,
    onOpenLikedSermons,
}: {
    displayStyle: DisplayStyle;
    subCategories: string[];
    sortValue: string;
    onOpenLikedSermons: () => void;
}) {
    const { data: playlistApiData } = usePlaylistsQuery(true);

    const playlistRows = useMemo(() => {
        const data = playlistApiData;
        if (data == null) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object' && data !== null && 'items' in data) {
            const items = (data as { items: unknown }).items;
            return Array.isArray(items) ? items : [];
        }
        return [];
    }, [playlistApiData]);

    const mapped = useMemo(
        () =>
            playlistRows
                .map((d) => playlistDocToRow(d))
                .filter((r): r is NonNullable<typeof r> => r != null),
        [playlistRows],
    );

    const filtered = useMemo(() => {
        const filterLabel = subCategories[0] ?? 'All Playlist';
        if (filterLabel === 'By You') {
            return mapped;
        }
        if (filterLabel === 'By Troott') {
            return [];
        }
        return mapped;
    }, [mapped, subCategories]);

    const sorted = useMemo(() => {
        const copy = [...filtered];
        if (sortValue === 'Alphabetical') {
            return copy.sort((a, b) => a.title.localeCompare(b.title));
        }
        return copy;
    }, [filtered, sortValue]);

    if (!sorted.length) {
        return (
            <LibraryEmptyState
                title="No playlists yet"
                subtitle="Create a playlist or browse Troott picks."
                actionLabel="Explore sermons"
                actionFilled
                onAction={() => router.push('/search')}
                secondaryActionLabel="Browse liked sermons"
                onSecondaryAction={onOpenLikedSermons}
            />
        );
    }

    return (
        <View style={{ gap: theme.sizes.spacing.sm }}>
            {sorted.map((pl) => (
                <Pressable
                    key={pl.id}
                    style={styles.row}
                    onPress={() => router.push(`/playlist/${pl.id}`)}
                >
                    <View style={{ flex: 1 }}>
                        <Text color={theme.colors.white[50]} numberOfLines={2}>
                            {pl.title}
                        </Text>
                        {pl.description ? (
                            <Text
                                size="sm"
                                color={theme.colors.grey[400]}
                                numberOfLines={2}
                            >
                                {pl.description}
                            </Text>
                        ) : null}
                    </View>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
    },
});
