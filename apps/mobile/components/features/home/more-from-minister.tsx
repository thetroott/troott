import { Image, StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import { theme } from '@/constants/theme';
import { FlashList } from '@shopify/flash-list';
import Text from '@/components/ui/text';
import { SeeMore } from '@/components/features/navigation';
import { router } from 'expo-router';
import SermonCard from '@/components/features/search/sermon-card';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';
import { tracks } from '@/_data/_mock/tracks';

const MoreFromMinister = () => {
    const { data: sermons, isLoading } = useSermonsCatalog();

    // Use fallback data if sermons are not loaded
    const dataSource = sermons && sermons.length > 0 ? sermons : tracks;

    // Filter sermons by a specific minister (Apostle Joshua Selman in this case)
    const ministerSermons =
        dataSource?.filter((sermon) =>
            (sermon.artist || sermon.minister)?.includes(
                'Apostle Joshua Selman',
            ),
        ) || [];

    const ministerName =
        ministerSermons.length > 0
            ? ministerSermons[0].artist || ministerSermons[0].minister
            : 'Pastor Sam Adeyemi';

    const sermonsToShow = useMemo(
        () =>
            ministerSermons.length > 0
                ? ministerSermons.slice(0, 6)
                : dataSource?.slice(0, 6) || [],
        [ministerSermons, dataSource],
    );

    const tracklistDtos: SermonItemDTO[] = useMemo(
        () =>
            sermonsToShow.map((r, i) =>
                catalogRowToSermonItem({
                    ...r,
                    id:
                        r.id != null
                            ? String(r.id)
                            : `more-minister-${i}`,
                } as Partial<ISermonTrack> & { id: string | null }),
            ),
        [sermonsToShow],
    );

    if (isLoading && (!dataSource || dataSource.length === 0)) {
        return (
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.image}
                            source={require('@/assets/images/2.jpg')}
                        />
                        <View style={{ gap: theme.sizes.spacing.sm }}>
                            <Text>More From</Text>
                            <Text
                                color={theme.colors.white[50]}
                                weight="semiBold"
                                size="md"
                            >
                                Loading...
                            </Text>
                        </View>
                    </View>
                    <SeeMore
                        onPress={() => router.push('/see-more/minister-seemore')}
                    />
                </View>
                <Text
                    style={{
                        color: theme.colors.grey[300],
                        textAlign: 'center',
                        paddingVertical: 20,
                    }}
                >
                    Loading sermons...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={require('@/assets/images/2.jpg')}
                    />
                    <View style={{ gap: theme.sizes.spacing.sm }}>
                        <Text>More From</Text>
                        <Text
                            color={theme.colors.white[50]}
                            weight="semiBold"
                            size="md"
                        >
                            {ministerName}
                        </Text>
                    </View>
                </View>
                <SeeMore
                    onPress={() => router.push('/see-more/minister-seemore')}
                />
            </View>
            <FlashList
                data={sermonsToShow}
                keyExtractor={(item, i) =>
                    (item.id != null ? String(item.id) : `mfm-${i}`) + 'more'
                }
                horizontal
                snapToInterval={theme.sizes.screen.width * 0.6}
                showsHorizontalScrollIndicator={false}
                decelerationRate={-1}
                renderItem={({ item, index }) => {
                    const track = tracklistDtos[index];
                    if (!track) return null;
                    return (
                        <SermonCard
                            track={track}
                            index={index}
                            tracklist={tracklistDtos}
                            queue="Library"
                            variant="large"
                            cardStyle={{
                                marginRight: theme.sizes.spacing.md,
                                width: theme.sizes.screen.width * 0.7,
                            }}
                        />
                    );
                }}
            />
        </View>
    );
};

export default MoreFromMinister;

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    container: {
        gap: theme.sizes.spacing.lg,
    },
    imageContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    image: {
        height: 48,
        width: 48,
        borderRadius: theme.sizes.radius.full,
    },
});
