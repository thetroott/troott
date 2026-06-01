import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { CatalogSearchMinisterHit } from '@/api/hooks/app/useSearch';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import SermonCard from '@/components/features/search/sermon-card';
import SearchCatalogEntityRow from '@/components/features/search/search-catalog-entity-row';
import { SeeMore } from '@/components/features/navigation';

export type SearchFilterChip =
    | 'Playlists'
    | 'Sermon'
    | 'Series'
    | 'Ministers';

const CHIP_ORDER: SearchFilterChip[] = [
    'Playlists',
    'Sermon',
    'Series',
    'Ministers',
];

type PlaylistHit = {
    id: string;
    title: string;
    description?: string;
    image?: string;
};

function sermonIndexInList(id: string | null | undefined, list: SermonItemDTO[]) {
    if (id == null) return 0;
    const i = list.findIndex((t) => String(t.id) === String(id));
    return i >= 0 ? i : 0;
}

function FilterChip({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.chip, selected ? styles.chipOn : styles.chipOff]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
        >
            <Text size="sm" weight="medium" color={theme.colors.white[50]}>
                {label}
            </Text>
        </Pressable>
    );
}

export default function SearchCatalogResults({
    chip,
    onChipChange,
    sermons,
    ministers,
    playlists,
    queryLabel,
    onSermonPlaybackStarted,
}: {
    chip: SearchFilterChip;
    onChipChange: (c: SearchFilterChip) => void;
    sermons: SermonItemDTO[];
    ministers: CatalogSearchMinisterHit[];
    playlists: PlaylistHit[];
    queryLabel: string;
    /** After a sermon starts from search, close the search screen (e.g. `router.back`). */
    onSermonPlaybackStarted?: (sermonTitle: string) => void;
}) {
    const filtered = useMemo(() => {
        switch (chip) {
            case 'Playlists':
                return { sermons: [], ministers: [], playlists };
            case 'Sermon':
                return { sermons, ministers: [], playlists: [] };
            case 'Series':
                return {
                    sermons: sermons.filter((s) => s.seriesId != null),
                    ministers: [],
                    playlists: [],
                };
            case 'Ministers':
                return { sermons: [], ministers, playlists: [] };
        }
    }, [chip, sermons, ministers, playlists]);

    const hasAny =
        filtered.sermons.length > 0 ||
        filtered.ministers.length > 0 ||
        filtered.playlists.length > 0;

    const topSermon = filtered.sermons[0];
    const alsoLike = filtered.sermons.slice(1, 4);
    const ministerName = topSermon?.minister ?? null;
    const moreFromSermons =
        ministerName != null
            ? filtered.sermons
                  .filter((s) => s.minister === ministerName)
                  .slice(1, 12)
            : filtered.sermons.slice(1, 12);

    const topPlaylist = filtered.playlists[0];
    const morePlaylists =
        chip === 'Playlists' ? filtered.playlists.slice(1) : [];

    const topMinister = filtered.ministers[0];
    const moreMinisters =
        chip === 'Ministers' ? filtered.ministers.slice(1) : [];

    const ministerHit = useMemo(
        () =>
            ministerName != null
                ? ministers.find(
                      (m) =>
                          m.name?.toLowerCase().trim() ===
                          ministerName.toLowerCase().trim(),
                  )
                : undefined,
        [ministers, ministerName],
    );

    const chipRow = (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
        >
            {CHIP_ORDER.map((key) => (
                <FilterChip
                    key={key}
                    label={key}
                    selected={chip === key}
                    onPress={() => onChipChange(key)}
                />
            ))}
        </ScrollView>
    );

    if (!hasAny) {
        return (
            <View style={[styles.chipsWrap, styles.fillScroll]}>
                {chipRow}
                <Text size="sm" color={theme.colors.grey[400]} style={styles.mt}>
                    No matches in this category for &quot;{queryLabel}&quot;.
                </Text>
            </View>
        );
    }

    const sermonTracklist = filtered.sermons;

    return (
        <ScrollView
            style={styles.fillScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {chipRow}

            {topSermon ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        Top results
                    </Text>
                    <View style={styles.topCardShell}>
                        <SermonCard
                            track={topSermon}
                            index={sermonIndexInList(topSermon.id, sermonTracklist)}
                            tracklist={sermonTracklist}
                            queue="Search"
                            variant="small"
                            cardStyle={styles.topSermonCard}
                            onPlaybackStarted={onSermonPlaybackStarted}
                        />
                    </View>
                </View>
            ) : topPlaylist ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        Top results
                    </Text>
                    <View style={styles.topCardShell}>
                        <SearchCatalogEntityRow
                            layout="shell"
                            imageUri={topPlaylist.image}
                            imageShape="square"
                            title={topPlaylist.title}
                            subtitle={topPlaylist.description ?? 'Playlist'}
                            onPress={() =>
                                router.push(`/playlist/${topPlaylist.id}`)
                            }
                        />
                    </View>
                </View>
            ) : topMinister ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        Top results
                    </Text>
                    <View style={styles.topCardShell}>
                        <SearchCatalogEntityRow
                            layout="shell"
                            imageUri={topMinister.image}
                            imageShape="circle"
                            title={topMinister.name ?? 'Minister'}
                            subtitle="Minister"
                            onPress={() =>
                                router.push(`/minister/${topMinister.id}`)
                            }
                        />
                    </View>
                </View>
            ) : null}

            {alsoLike.length > 0 ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        You may also like this
                    </Text>
                    {alsoLike.map((item) => (
                        <SermonCard
                            key={String(item.id)}
                            track={item}
                            index={sermonIndexInList(item.id, sermonTracklist)}
                            tracklist={sermonTracklist}
                            queue="Search"
                            variant="small"
                            cardStyle={styles.alsoLikeCard}
                            onPlaybackStarted={onSermonPlaybackStarted}
                        />
                    ))}
                </View>
            ) : null}

            {morePlaylists.length > 0 ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        More results
                    </Text>
                    {morePlaylists.map((pl, index) => (
                        <SearchCatalogEntityRow
                            key={pl.id}
                            layout="list"
                            imageUri={pl.image}
                            imageShape="square"
                            title={pl.title}
                            subtitle={pl.description ?? 'Playlist'}
                            onPress={() => router.push(`/playlist/${pl.id}`)}
                            style={
                                index === morePlaylists.length - 1
                                    ? styles.rowLast
                                    : undefined
                            }
                        />
                    ))}
                </View>
            ) : null}

            {moreMinisters.length > 0 ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        More results
                    </Text>
                    {moreMinisters.map((m, index) => (
                        <SearchCatalogEntityRow
                            key={m.id}
                            layout="list"
                            imageUri={m.image}
                            imageShape="circle"
                            title={m.name ?? 'Minister'}
                            subtitle="Minister"
                            onPress={() => router.push(`/minister/${m.id}`)}
                            style={
                                index === moreMinisters.length - 1
                                    ? styles.rowLast
                                    : undefined
                            }
                        />
                    ))}
                </View>
            ) : null}

            {ministerName != null && moreFromSermons.length > 0 ? (
                <View style={styles.block}>
                    <View style={styles.moreHdr}>
                        <View style={styles.moreHdrLeft}>
                            {ministerHit?.image ? (
                                <Image
                                    source={{ uri: ministerHit.image }}
                                    style={styles.moreAvatar}
                                    accessibilityIgnoresInvertColors
                                />
                            ) : (
                                <View style={[styles.moreAvatar, styles.ph]} />
                            )}
                            <View style={styles.flex1}>
                                <Text
                                    size="xs"
                                    color={theme.colors.grey[400]}
                                    weight="medium"
                                    textStyle={styles.moreFromCaps}
                                >
                                    MORE FROM
                                </Text>
                                <Text
                                    weight="semiBold"
                                    size="base"
                                    color={theme.colors.white[50]}
                                    numberOfLines={2}
                                >
                                    {ministerName}
                                </Text>
                            </View>
                        </View>
                        <SeeMore
                            onPress={() => {
                                const m =
                                    ministerHit ??
                                    ministers.find(
                                        (x) =>
                                            x.name?.toLowerCase().trim() ===
                                            ministerName.toLowerCase().trim(),
                                    );
                                if (m) router.push(`/minister/${m.id}`);
                            }}
                        />
                    </View>
                    <FlashList
                        data={moreFromSermons}
                        horizontal
                        snapToInterval={theme.sizes.screen.width * 0.72}
                        showsHorizontalScrollIndicator={false}
                        decelerationRate={-1}
                        keyExtractor={(item, i) =>
                            String(item.id ?? `more-from-${i}`)
                        }
                        renderItem={({ item }) => (
                            <SermonCard
                                track={item}
                                index={sermonIndexInList(item.id, sermonTracklist)}
                                tracklist={sermonTracklist}
                                queue="Search"
                                variant="large"
                                cardStyle={styles.moreFromLargeCard}
                                onPlaybackStarted={onSermonPlaybackStarted}
                            />
                        )}
                    />
                </View>
            ) : null}

            {filtered.ministers.length > 0 && chip !== 'Ministers' ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        Ministers
                    </Text>
                    {filtered.ministers.map((m, index) => (
                        <SearchCatalogEntityRow
                            key={m.id}
                            layout="list"
                            imageUri={m.image}
                            imageShape="circle"
                            title={m.name ?? 'Minister'}
                            subtitle="Minister"
                            onPress={() => router.push(`/minister/${m.id}`)}
                            style={
                                index === filtered.ministers.length - 1
                                    ? styles.rowLast
                                    : undefined
                            }
                        />
                    ))}
                </View>
            ) : null}

            {filtered.playlists.length > 0 && chip !== 'Playlists' ? (
                <View style={styles.block}>
                    <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                        Playlists
                    </Text>
                    {filtered.playlists.map((pl, index) => (
                        <SearchCatalogEntityRow
                            key={pl.id}
                            layout="list"
                            imageUri={pl.image}
                            imageShape="square"
                            title={pl.title}
                            subtitle={pl.description ?? 'Playlist'}
                            onPress={() => router.push(`/playlist/${pl.id}`)}
                            style={
                                index === filtered.playlists.length - 1
                                    ? styles.rowLast
                                    : undefined
                            }
                        />
                    ))}
                </View>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    fillScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.sizes.spacing['2xl'],
        gap: theme.sizes.spacing.lg,
    },
    chipsWrap: {
        gap: theme.sizes.spacing.md,
    },
    chipRow: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.xs,
    },
    chip: {
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.full,
        borderWidth: 1,
        backgroundColor: theme.colors.grey[700],
    },
    chipOn: {
        borderColor: theme.colors.white[50],
    },
    chipOff: {
        borderColor: theme.colors.grey[600],
    },
    mt: {
        marginTop: theme.sizes.spacing.md,
    },
    block: {
        gap: theme.sizes.spacing.sm,
    },
    topCardShell: {
        backgroundColor: theme.colors.grey[700],
        borderRadius: theme.sizes.radius.md,
        paddingHorizontal: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.xs,
        overflow: 'hidden',
    },
    topSermonCard: {
        width: '100%',
        borderBottomWidth: 0,
        backgroundColor: 'transparent',
        paddingBottom: theme.sizes.spacing.sm,
    },
    alsoLikeCard: {
        width: '100%',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.grey[700],
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    ph: {
        backgroundColor: theme.colors.grey[600],
    },
    flex1: {
        flex: 1,
        minWidth: 0,
    },
    moreHdr: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.sizes.spacing.md,
    },
    moreHdrLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        minWidth: 0,
    },
    moreAvatar: {
        width: 48,
        height: 48,
        borderRadius: theme.sizes.radius.full,
    },
    moreFromCaps: {
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    moreFromLargeCard: {
        marginRight: theme.sizes.spacing.md,
        width: theme.sizes.screen.width * 0.7,
    },
});
