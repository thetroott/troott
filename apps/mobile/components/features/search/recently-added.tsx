import { StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import Text from '@/components/ui/text';
import { FlashList } from '@shopify/flash-list';
import { theme } from '@/constants/theme';
import { TransformArray } from '@/utils/transform-array';
import SermonCard from './sermon-card';
import { tracks } from '@/_data/_mock/tracks';
import type { ISermonTrack } from '@/dtos/sermon.dto';
import type { SermonItemDTO } from '@/types/sermon';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';

const ROWS_PER_SWIPE = 2;

/**
 * Search landing carousel — same catalog source and mapping as home {@link SermonsForYou}.
 */
const RecentlyAdded = () => {
    const { data: sermons, isLoading, error } = useSermonsCatalog();

    const sermonsData =
        sermons && sermons.length > 0 ? sermons : (tracks as ISermonTrack[]);

    const tracklistDtos: SermonItemDTO[] = useMemo(
        () =>
            sermonsData.map((r, i) =>
                catalogRowToSermonItem({
                    ...r,
                    id: r.id != null ? String(r.id) : `recent-added-${i}`,
                }),
            ),
        [sermonsData],
    );

    const rows = useMemo(
        () => TransformArray(sermonsData, ROWS_PER_SWIPE) as ISermonTrack[][],
        [sermonsData],
    );

    if (isLoading && sermonsData.length === 0) {
        return (
            <View style={styles.container}>
                <Text color={theme.colors.white[50]}>Recently Added</Text>
                <Text size="sm" color={theme.colors.grey[300]} style={styles.message}>
                    Loading sermons...
                </Text>
            </View>
        );
    }

    if (error && sermonsData.length === 0) {
        return (
            <View style={styles.container}>
                <Text color={theme.colors.white[50]}>Recently Added</Text>
                <Text size="sm" color={theme.colors.grey[300]} style={styles.message}>
                    Could not load sermons.
                </Text>
            </View>
        );
    }

    if (!sermonsData.length) {
        return (
            <View style={styles.container}>
                <Text color={theme.colors.white[50]}>Recently Added</Text>
                <Text size="sm" color={theme.colors.grey[300]} style={styles.message}>
                    No sermons available at the moment.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text color={theme.colors.white[50]}>Recently Added</Text>
            <FlashList
                data={rows}
                keyExtractor={(_, index) => `recent-group-${index}`}
                horizontal
                snapToInterval={theme.sizes.screen.width * 0.8}
                showsHorizontalScrollIndicator={false}
                decelerationRate={-1}
                renderItem={({ item: group, index: groupIndex }) => (
                    <View style={{ gap: 10, marginRight: 10 }}>
                        {group.map((row, slotIndex) => {
                            const flatIndex =
                                groupIndex * ROWS_PER_SWIPE + slotIndex;
                            const track = tracklistDtos[flatIndex];
                            if (!track) return null;
                            return (
                                <SermonCard
                                    key={row.id ?? `slot-${flatIndex}`}
                                    track={track}
                                    index={flatIndex}
                                    tracklist={tracklistDtos}
                                    queue="Search"
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

export default RecentlyAdded;

const styles = StyleSheet.create({
    container: {
        gap: theme.sizes.spacing.md,
    },
    message: {
        paddingVertical: theme.sizes.spacing.md,
    },
});
