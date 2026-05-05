import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'iconsax-react-nativejs';
import { router, useLocalSearchParams } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import SearchRecentlyPlayedSection from '@/components/features/search/search-recently-played-section';
import NewSermon from '@/components/features/home/new-sermon';
import PlayList from '@/components/features/playlist/playlist';
import SimilarMinisters from '@/components/features/home/similar-ministers';
import TopicMostStreamedSection from '@/components/features/search/topic-most-streamed-section';
import { getBrowseTopicLabel } from '@/constants/browse-topics';
import { tracks } from '@/_data/_mock/tracks';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/stores/app/network';
import { networkStatusTypes } from '@/types/network-status';
import type { SermonItemDTO } from '@/types/sermon';
import { QueuingType } from '@/utils/enums.util';

type CatalogRow = Parameters<typeof catalogRowToSermonItem>[0] & {
    artist?: string | null;
};

export default function SearchTopicScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const slugStr = String(slug ?? '');
    const topicLabel = useMemo(() => getBrowseTopicLabel(slugStr), [slugStr]);

    const { data: sermons, isLoading } = useSermonsCatalog();
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    const dataSource: CatalogRow[] = useMemo(
        () =>
            sermons && sermons.length > 0
                ? (sermons as CatalogRow[])
                : (tracks as CatalogRow[]),
        [sermons],
    );

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

    const newReleaseDtos = useMemo(
        () => allDtos.slice(0, 6),
        [allDtos],
    );

    const trendingTracks = useMemo(
        () => dataSource.slice(0, 8),
        [dataSource],
    );

    const mostStreamedDtos = useMemo(
        () => allDtos.slice(4, 12),
        [allDtos],
    );

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
                    {isLoading && dataSource.length === 0 ? (
                        <Text size="sm" color={theme.colors.grey[300]}>
                            Loading…
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
                <SimilarMinisters title={ministersTitle} />
                <TopicMostStreamedSection sermons={mostStreamedDtos} />
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
});
