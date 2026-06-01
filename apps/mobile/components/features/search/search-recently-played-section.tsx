import React, { useMemo } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import SermonCard from '@/components/features/search/sermon-card';
import { LoadingState } from '@/components/ui/loading-state';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { useSeeMoreSermons } from '@/engine/hooks/useSeeMoreSermons';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import type { Queue } from '@/api/dtos/queue-client.dto';

export type SearchRecentlyPlayedSectionProps = {
    title?: string;
    queue?: Queue;
    wrapStyle?: StyleProp<ViewStyle>;
};

/**
 * Horizontal carousel; reuses {@link SermonCard} so kebab + sheets match search/results.
 */
export default function SearchRecentlyPlayedSection(
    props: SearchRecentlyPlayedSectionProps = {},
) {
    const {
        title = 'Recently played',
        queue = 'Recently Played',
        wrapStyle,
    } = props;
    const windowWidth = Dimensions.get('window').width;
    const cardWidth = Math.min(324, windowWidth);

    const { items, isLoading } = useSeeMoreSermons('recentlyPlayed');

    const rows: SermonItemDTO[] = useMemo(
        () => items.slice(0, 8),
        [items],
    );

    if (isLoading && rows.length === 0) {
        return (
            <View style={[styles.wrap, wrapStyle]}>
                <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                    {title}
                </Text>
                <LoadingState label="Loading..." />
            </View>
        );
    }

    if (rows.length === 0) {
        return null;
    }

    return (
        <View style={[styles.wrap, wrapStyle]}>
            <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                {title}
            </Text>
            <FlatList
                horizontal
                data={rows}
                keyExtractor={(item, i) => (item.id ?? `rp-${i}`).toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <SermonCard
                        track={item}
                        index={index}
                        tracklist={rows}
                        queue={queue}
                        variant="large"
                        cardStyle={{ width: cardWidth, marginRight: 12 }}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: theme.sizes.spacing.md,
    },
    listContent: {
        paddingRight: theme.sizes.spacing.base,
    },
});
