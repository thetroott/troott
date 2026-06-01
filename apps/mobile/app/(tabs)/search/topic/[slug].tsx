import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'iconsax-react-nativejs';
import { router, useLocalSearchParams } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import Loader from '@/components/ui/loader';
import { theme } from '@/constants/theme';
import SearchRecentlyPlayedSection from '@/components/features/search/search-recently-played-section';
import NewSermon from '@/components/features/home/new-sermon';
import PlayList from '@/components/features/playlist/playlist';
import SimilarMinisters from '@/components/features/home/similar-ministers';
import TopicMostStreamedSection from '@/components/features/search/topic-most-streamed-section';
import { getBrowseTopicLabel } from '@/constants/browse-topics';
import { useDiscoveryHomeRails } from '@/engine/hooks/useDiscoveryHomeRails';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/lib/state/network-store';
import { networkStatusTypes } from '@/api/dtos/network.dto';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import { QueuingType } from '@/api/types';
import { useCatalogSearchQuery } from '@/api/hooks/app/useSearch';
import { useSermonsByTopicQuery } from '@/api/hooks/app/useSermon';
import { captureSearchEvent } from '@/components/features/search/search.analytics';

type CatalogRow = Parameters<typeof catalogRowToSermonItem>[0] & {
    artist?: string | null;
    topic?: string | null;
};

function matchesTopic(row: CatalogRow, slug: string, label: string): boolean {
    const topic = (row.topic ?? '').trim().toLowerCase();
    const slugNorm = slug.trim().toLowerCase();
    const labelNorm = label.trim().toLowerCase();
    return (
        topic === slugNorm ||
        topic === labelNorm ||
        topic.includes(labelNorm) ||
        labelNorm.includes(topic)
    );
}

export default function SearchTopicScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const slugStr = String(slug ?? '');
    const topicLabel = useMemo(() => getBrowseTopicLabel(slugStr), [slugStr]);
    const topicKey = topicLabel || slugStr;

    const {
        data: topicSermons = [],
        isLoading: topicLoading,
        isError: topicError,
        refetch: refetchTopic,
    } = useSermonsByTopicQuery(topicKey, topicKey.length > 0);

    const {
        allSermons: sermons,
        isLoading: catalogLoading,
        error: catalogError,
        refetch: refetchCatalog,
    } = useDiscoveryHomeRails();

    const {
        data: topicSearch,
        isFetching: topicSearchFetching,
        isError: topicSearchError,
        refetch: refetchTopicSearch,
    } = useCatalogSearchQuery(topicLabel, topicLabel.length >= 2);

    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    useEffect(() => {
        if (!slugStr) return;
        captureSearchEvent('search_topic_opened', {
            topic_slug: slugStr,
            source: 'topic_screen',
        });
    }, [slugStr]);

    const bundledTopicRows: CatalogRow[] = useMemo(() => {
        const source = (sermons ?? []) as CatalogRow[];
        const filtered = source.filter((row) =>
            matchesTopic(row, slugStr, topicLabel),
        );
        return filtered.length > 0 ? filtered : source.slice(0, 12);
    }, [sermons, slugStr, topicLabel]);

    const dataSource: CatalogRow[] = useMemo(() => {
        if (topicSermons.length > 0) {
            return topicSermons.map((item) => ({
                id: item.id != null ? String(item.id) : null,
                title: item.title ?? '',
                minister: item.minister ?? '',
                topic: item.topic ?? topicLabel,
                image:
                    typeof item.image === 'string'
                        ? item.image
                        : item.artwork ?? null,
                url: item.url ?? null,
                duration: item.duration ?? null,
            }));
        }
        const searchRows = topicSearch?.sermons ?? [];
        if (searchRows.length > 0) {
            return searchRows.map((item) => ({
                id: item.id != null ? String(item.id) : null,
                title: item.title ?? '',
                minister: item.minister ?? '',
                topic: item.topic ?? topicLabel,
                image:
                    typeof item.image === 'string'
                        ? item.image
                        : item.artwork ?? null,
                url: item.url ?? null,
                duration: item.duration ?? null,
            }));
        }
        return bundledTopicRows;
    }, [topicSermons, topicSearch?.sermons, bundledTopicRows, topicLabel]);

    const allDtos: SermonItemDTO[] = useMemo(
        () =>
            dataSource.map((r, i) =>
                catalogRowToSermonItem({
                    ...r,
                    id: r.id != null ? String(r.id) : `topic-row-${i}`,
                }),
            ),
        [dataSource],
    );

    const newReleaseDtos = useMemo(() => allDtos.slice(0, 6), [allDtos]);
    const trendingTracks = useMemo(() => dataSource.slice(0, 8), [dataSource]);
    const mostStreamedDtos = useMemo(() => allDtos.slice(4, 12), [allDtos]);

    const isLoading =
        (topicLoading && dataSource.length === 0) ||
        (catalogLoading && dataSource.length === 0 && topicError);

    const showLoadError =
        !isLoading &&
        dataSource.length === 0 &&
        (Boolean(topicError) || Boolean(catalogError) || topicSearchError);

    const playFromList = useCallback(
        (list: SermonItemDTO[]) =>
            (item: SermonItemDTO, index: number) => {
                if (item.id == null) return;
                void loadNewQueue({
                    api: undefined,
                    networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
                    track: item,
                    index,
                    tracklist: list,
                    queue: 'Search',
                    queuingType: QueuingType.FromSelection,
                    startPlayback: true,
                });
            },
        [loadNewQueue, networkStatus],
    );

    const onNewReleasePress = useMemo(
        () => playFromList(newReleaseDtos),
        [playFromList, newReleaseDtos],
    );

    const retryLoad = useCallback(() => {
        void refetchTopic();
        void refetchCatalog();
        void refetchTopicSearch();
    }, [refetchTopic, refetchCatalog, refetchTopicSearch]);

    const newReleasesTitle = `New Releases on ${topicLabel}`;
    const trendingTitle = `Trending ${topicLabel} Series`;
    const ministersTitle = `Top Ministers on ${topicLabel}`;

    return (
        <ScreenView>
            <View style={styles.navRow}>
                <Pressable
                    style={styles.backRow}
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Back to Search"
                    hitSlop={8}
                >
                    <ArrowLeft size={22} color={theme.colors.teal[400]} />
                    <Text size="sm" weight="medium" color={theme.colors.teal[400]}>
                        Search
                    </Text>
                </Pressable>
            </View>
            <Text
                weight="semiBold"
                size="2xl"
                color={theme.colors.white[50]}
                style={styles.pageTitle}
            >
                {topicLabel}
            </Text>

            {showLoadError ? (
                <View style={styles.errorWrap}>
                    <Text size="sm" color={theme.colors.grey[300]} style={styles.errorText}>
                        Could not load {topicLabel} content. Check your connection and try
                        again.
                    </Text>
                    <Pressable
                        style={styles.retryButton}
                        onPress={retryLoad}
                        accessibilityRole="button"
                        accessibilityLabel="Retry loading topic"
                    >
                        <Text size="sm" weight="semiBold" color={theme.colors.teal[400]}>
                            Retry
                        </Text>
                    </Pressable>
                </View>
            ) : null}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.body}
            >
                <SearchRecentlyPlayedSection
                    wrapStyle={styles.firstSection}
                    queue="Search"
                />
                <View style={styles.section}>
                    <Text
                        weight="semiBold"
                        size="lg"
                        color={theme.colors.white[50]}
                    >
                        {newReleasesTitle}
                    </Text>
                    {isLoading ? (
                        <View style={styles.loadingRow}>
                            <Loader tone="brand" />
                            <Text size="sm" color={theme.colors.grey[300]}>
                                Loading…
                            </Text>
                        </View>
                    ) : allDtos.length === 0 ? (
                        <Text size="sm" color={theme.colors.grey[300]}>
                            No sermons for this topic yet. Try another topic or search
                            by keyword.
                        </Text>
                    ) : (
                        <View style={styles.carouselBleed}>
                            <NewSermon
                                sermons={newReleaseDtos}
                                labelForItem={(_, i) =>
                                    i % 2 === 0 ? 'NEW SERMON' : 'NEW PLAYLIST'
                                }
                                formatFooter={(_, i) =>
                                    i % 2 === 0 ? '2 DAYS AGO' : '5 DAYS AGO'
                                }
                                onPressCard={onNewReleasePress}
                                onPressPlay={onNewReleasePress}
                            />
                        </View>
                    )}
                </View>
                {trendingTracks.length > 0 ? (
                    <View style={styles.section}>
                        <Text
                            weight="semiBold"
                            size="lg"
                            color={theme.colors.white[50]}
                        >
                            {trendingTitle}
                        </Text>
                        <PlayList
                            title="Trusting God"
                            church="Koinonia Minstry"
                            tracks={trendingTracks}
                            description="Ain't no journey like a faith journey. Soundtracking your spiritual growth with sermons that uplift!"
                        />
                    </View>
                ) : null}
                <SimilarMinisters title={ministersTitle} />
                {mostStreamedDtos.length > 0 ? (
                    <TopicMostStreamedSection sermons={mostStreamedDtos} />
                ) : null}
            </ScrollView>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    navRow: {
        marginBottom: theme.sizes.spacing.md,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.xs,
        alignSelf: 'flex-start',
    },
    pageTitle: {
        marginBottom: theme.sizes.spacing.sm,
    },
    body: {
        gap: theme.sizes.spacing.xl,
        paddingBottom: 100,
    },
    firstSection: {
        marginTop: 0,
    },
    section: {
        gap: theme.sizes.spacing.md,
    },
    carouselBleed: {
        marginHorizontal: -theme.sizes.spacing.md,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.md,
    },
    errorWrap: {
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.lg,
        paddingHorizontal: theme.sizes.spacing.lg,
        marginBottom: theme.sizes.spacing.md,
    },
    errorText: {
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: theme.sizes.spacing.sm,
        paddingHorizontal: theme.sizes.spacing.lg,
    },
});
