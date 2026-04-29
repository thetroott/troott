import { Pressable, StyleSheet, View } from 'react-native';
import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';
import React from 'react';
import type { SermonItemDTO } from '@/types/sermon';
import SermonCard from '@/components/features/search/sermon-card';
import { FlashList } from '@shopify/flash-list';
import { TransformArray } from '@/utils/transform-array';

const styles = StyleSheet.create({
    section: {
        gap: theme.sizes.spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: { flexShrink: 1, minWidth: 0, flex: 1 },
    messageCenter: {
        paddingVertical: 20,
        textAlign: 'center',
    },
    seeMoreButton: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingVertical: theme.sizes.spacing.xs,
        borderRadius: theme.sizes.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.grey[400],
    },
    flashColumn: {
        marginRight: 10,
        gap: 10,
    },
});

type TopSermonsProps = {
    sermons: SermonItemDTO[];
    onPressSeeMore?: () => void;
    title?: string;
};

const TopSermons = ({
    sermons,
    onPressSeeMore,
    title = 'Top Sermons',
}: TopSermonsProps) => {
    const ROWS_PER_SWIPE = 4;
    if (!sermons || sermons.length === 0) {
        return (
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <Text
                        style={styles.title}
                        size="sm"
                        color={theme.colors.white[50]}
                        weight="semiBold"
                    >
                        {title}
                    </Text>
                </View>
                <Text style={styles.messageCenter} color={theme.colors.grey[300]}>
                    No sermons available for this minister.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <View style={styles.headerRow}>
                <Text
                    style={styles.title}
                    size="md"
                    color={theme.colors.white[50]}
                    weight="semiBold"
                >
                    {title}
                </Text>
                <Pressable
                    style={styles.seeMoreButton}
                    onPress={onPressSeeMore}
                >
                    <Text size="sm" color={theme.colors.grey[100]}>
                        See More
                    </Text>
                </Pressable>
            </View>
            <FlashList
                data={TransformArray(sermons, ROWS_PER_SWIPE) as SermonItemDTO[][]}
                keyExtractor={(_, index) => `${index}-sermon-group`}
                horizontal
                snapToInterval={theme.sizes.screen.width * 0.8}
                showsHorizontalScrollIndicator={false}
                decelerationRate={-1}
                renderItem={({ item: group, index: groupIndex }) => (
                    <View style={styles.flashColumn}>
                        {group.map((track, slotIndex) => {
                            const flatIndex =
                                groupIndex * ROWS_PER_SWIPE + slotIndex;
                            return (
                                <SermonCard
                                    key={track.id ?? `top-sermon-${flatIndex}`}
                                    track={track}
                                    index={flatIndex}
                                    tracklist={sermons}
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

export default TopSermons;
