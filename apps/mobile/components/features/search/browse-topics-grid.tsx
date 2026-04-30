import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import BrowseTopicTile from '@/components/features/search/browse-topic-tile';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { BrowseTopic } from '@/constants/browse-topics';

/** Figma `Browse-Categories` (4995:35775): 16 screen inset, 16 between tiles, 12 under heading. */
const TILE_WIDTH = 163.5;
const TILE_GAP = theme.sizes.spacing.md;
const HEADING_TO_GRID = theme.sizes.spacing.base;

function BrowseTopicsGrid({ topics }: { topics: BrowseTopic[] }) {
    const tileWidth = useMemo(() => TILE_WIDTH, []);

    return (
        <View style={styles.wrap}>
            <Text
                weight="semiBold"
                size="md"
                color={theme.colors.white[50]}
                textStyle={styles.headingText}
            >
                Browse Topics
            </Text>
            <View style={styles.grid}>
                {topics.map((item) => {
                    return (
                        <View key={item.slug} style={styles.tileItem}>
                            <BrowseTopicTile
                                topic={item}
                                tileWidth={tileWidth}
                                onPress={() =>
                                    router.push(
                                        `/search/topic/${encodeURIComponent(item.slug)}`,
                                    )
                                }
                            />
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

export default BrowseTopicsGrid;

const styles = StyleSheet.create({
    wrap: {
        gap: HEADING_TO_GRID,
    },
    headingText: {
        lineHeight: 27,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    tileItem: {
        marginBottom: TILE_GAP,
        width: TILE_WIDTH,
    },
});
