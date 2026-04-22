import SermonCard from '@/components/features/search/sermon-card';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { SermonItemDTO } from '@/types/sermon';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { SeeMore } from '@/components/features/navigation';

import { ISermonTrack } from '@/dtos/sermon.dto';
import { tracks } from '@/_data/_mock/tracks';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import { FlashList } from '@shopify/flash-list';
import { TransformArray } from '@/utils/transform-array';
import Text from '@/components/ui/text';

const styles = StyleSheet.create({
    section: {
        gap: theme.sizes.spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        flexShrink: 1,
        minWidth: 0,
        flex: 1,
        paddingRight: theme.sizes.spacing.sm,
    },
    messageCenter: {
        paddingVertical: 20,
        textAlign: 'center',
    },
    flashColumn: {
        marginRight: 10,
        gap: 10,
    },
});

const SermonsForYou = () => {
    const ROWS_PER_SWIPE = 4;
    const { data: sermons, isLoading, error } = useSermonsCatalog();

    const sermonsData =
        sermons && sermons.length > 0 ? sermons : (tracks as ISermonTrack[]);

    const tracklistDtos: SermonItemDTO[] = useMemo(
        () =>
            sermonsData.map((r) =>
                catalogRowToSermonItem(
                    r as Partial<ISermonTrack> & { id: string | null },
                ),
            ),
        [sermonsData],
    );

    const SectionHeader = () => (
        <View style={styles.headerRow}>
            <Text
                style={styles.title}
                size="md"
                color={theme.colors.white[100]}
                weight="semiBold"
            >
                Sermons for you
            </Text>
            <SeeMore onPress={() => router.push('/see-more/sermons-for-you')} />
        </View>
    );

    if (isLoading && (!sermonsData || sermonsData.length === 0)) {
        return (
            <View style={styles.section}>
                <SectionHeader />
                <Text
                    style={styles.messageCenter}
                    color={theme.colors.white[100]}
                >
                    Loading sermons...
                </Text>
            </View>
        );
    }

    if (error && (!sermonsData || sermonsData.length === 0)) {
        return (
            <View style={styles.section}>
                <SectionHeader />
                <Text
                    style={styles.messageCenter}
                    color={theme.colors.grey[300]}
                >
                    Could not load sermons.
                </Text>
            </View>
        );
    }

    if (!sermonsData || sermonsData.length === 0) {
        return (
            <View style={styles.section}>
                <SectionHeader />
                <Text
                    style={styles.messageCenter}
                    color={theme.colors.grey[300]}
                >
                    No sermons available at the moment.
                </Text>
            </View>
        );
    }

    const grouped = TransformArray(
        sermonsData,
        ROWS_PER_SWIPE,
    ) as ISermonTrack[][];

    return (
        <View style={styles.section}>
            <SectionHeader />

            <FlashList
                data={grouped}
                keyExtractor={(_, index) => `${index}-sermon-group`}
                horizontal
                snapToInterval={theme.sizes.screen.width * 0.8}
                showsHorizontalScrollIndicator={false}
                decelerationRate={-1}
                renderItem={({ item: group, index: groupIndex }) => (
                    <View style={styles.flashColumn}>
                        {group.map((row, slotIndex) => {
                            const flatIndex =
                                groupIndex * ROWS_PER_SWIPE + slotIndex;
                            const track = tracklistDtos[flatIndex];
                            if (!track) return null;
                            return (
                                <SermonCard
                                    key={row.id ?? `sermon-${flatIndex}`}
                                    track={track}
                                    index={flatIndex}
                                    tracklist={tracklistDtos}
                                    queue="Library"
                                    variant="small"
                                />
                            );
                        })}
                    </View>
                )}
            />
        </View>
    );
};

export default SermonsForYou;
