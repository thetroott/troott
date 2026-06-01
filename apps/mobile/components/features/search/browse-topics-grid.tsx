import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';

import BrowseTopicTile from '@/components/features/search/browse-topic-tile';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { BrowseTopic } from '@/constants/browse-topics';
import { captureSearchEvent } from '@/components/features/search/search.analytics';

/**
 * Figma `Browse-Categories` / `Categories` (4995:35775, 4995:35778): 16 screen inset
 * (`ScreenView` padding), 16 between columns, 12 under heading; tile 163.5 x ~120 at 375pt.
 */
const TILE_GAP = theme.sizes.spacing.md;
const HEADING_TO_GRID = theme.sizes.spacing.base;
const HORIZONTAL_INSET = theme.sizes.spacing.md;

function BrowseTopicsGrid({ topics }: { topics: BrowseTopic[] }) {
    const { width: windowWidth } = useWindowDimensions();

    const tileWidth = useMemo(() => {
        const contentW = windowWidth - HORIZONTAL_INSET * 2;
        return (contentW - TILE_GAP) / 2;
    }, [windowWidth]);

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
                        <View
                            key={item.slug}
                            style={[styles.tileItem, { width: tileWidth }]}
                        >
                            <BrowseTopicTile
                                topic={item}
                                tileWidth={tileWidth}
                                onPress={() => {
                                    captureSearchEvent('search_topic_opened', {
                                        topic_slug: item.slug,
                                        source: 'search_landing',
                                    });
                                    router.push(
                                        `/search/topic/${encodeURIComponent(item.slug)}`,
                                    );
                                }}
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
        width: '100%',
    },
    headingText: {
        lineHeight: 27,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    tileItem: {
        marginBottom: TILE_GAP,
    },
});
