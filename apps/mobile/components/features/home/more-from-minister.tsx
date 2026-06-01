import { Image, StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import { theme } from '@/constants/theme';
import { FlashList } from '@shopify/flash-list';
import Text from '@/components/ui/text';
import { SeeMore } from '@/components/features/navigation';
import { router } from 'expo-router';
import SermonCard from '@/components/features/search/sermon-card';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import { useDiscoveryHomeRails } from '@/engine/hooks/useDiscoveryHomeRails';

type CatalogRow = Parameters<typeof catalogRowToSermonItem>[0] & {
    artist?: string | null;
};

const MoreFromMinister = () => {
    const { featuredMinister, mostPlayed, isLoading } = useDiscoveryHomeRails();

    const ministerName = featuredMinister?.name ?? 'Featured minister';
    const ministerImage =
        featuredMinister?.image != null && featuredMinister.image.length > 0
            ? { uri: featuredMinister.image }
            : require('@/assets/images/2.jpg');

    const sermonsToShow = useMemo((): CatalogRow[] => {
        if (featuredMinister && featuredMinister.sermons.length > 0) {
            return featuredMinister.sermons.slice(0, 6) as CatalogRow[];
        }
        return (mostPlayed.slice(0, 6) as CatalogRow[]) ?? [];
    }, [featuredMinister, mostPlayed]);

    const tracklistDtos: SermonItemDTO[] = useMemo(
        () =>
            sermonsToShow.map((r, i) =>
                catalogRowToSermonItem({
                    ...r,
                    id:
                        r.id != null
                            ? String(r.id)
                            : `more-minister-${i}`,
                }),
            ),
        [sermonsToShow],
    );

    if (isLoading && sermonsToShow.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={ministerImage} />
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

    if (!isLoading && sermonsToShow.length === 0) {
        return (
            <View style={styles.container}>
                <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                    More from ministers
                </Text>
                <Text
                    style={{
                        color: theme.colors.grey[300],
                        textAlign: 'center',
                        paddingVertical: 20,
                    }}
                >
                    No minister sermons available yet.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={styles.imageContainer}>
                    <Image style={styles.image} source={ministerImage} />
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
