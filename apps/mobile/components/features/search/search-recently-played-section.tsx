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
import { tracks } from '@/_data/_mock/tracks';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';
import type { Queue } from '@/types/queue-ref';

type CatalogRow = Parameters<typeof catalogRowToSermonItem>[0] & {
    artist?: string | null;
};

export type SearchRecentlyPlayedSectionProps = {
    title?: string;
    queue?: Queue;
    wrapStyle?: StyleProp<ViewStyle>;
};

/**
 * Horizontal carousel; reuses {@link SermonCard} so kebab + sheets match search/results.
 * Bleeds slightly past `ScreenView` padding (Figma peek).
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

    const { data: sermons, isLoading } = useSermonsCatalog();
    const rows: SermonItemDTO[] = useMemo(() => {
        const raw =
            sermons && sermons.length > 0 ? sermons : (tracks as CatalogRow[]);
        return raw.slice(0, 8).map((r, i) =>
            catalogRowToSermonItem({
                ...r,
                id: r.id != null ? String(r.id) : `rp-${i}`,
            }),
        );
    }, [sermons]);

    if (isLoading && rows.length === 0) {
        return (
            <View style={[styles.wrap, wrapStyle]}>
                <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                    {title}
                </Text>
                <LoadingState variant="inline" label="Loading recently played..." />
            </View>
        );
    }

    return (
        <View style={[styles.wrap, wrapStyle]}>
            <Text weight="semiBold" size="lg" color={theme.colors.white[50]}>
                {title}
            </Text>
            <View style={styles.bleed}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={rows}
                    keyExtractor={(item) => String(item.id)}
                    snapToInterval={cardWidth}
                    decelerationRate="fast"
                    contentContainerStyle={styles.hContent}
                    renderItem={({ item, index }) => (
                        <SermonCard
                            track={item}
                            index={index}
                            tracklist={rows}
                            queue={queue}
                            variant="small"
                            cardStyle={[
                                styles.card,
                                { width: cardWidth },
                            ]}
                        />
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: theme.sizes.spacing.md,
        marginTop: theme.sizes.spacing.md,
    },
    /** Pull carousel to screen edges for next-card peek (Figma). */
    bleed: {
        marginHorizontal: -theme.sizes.spacing.md,
    },
    hContent: {
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    card: {
        backgroundColor: theme.colors.grey[900],
        borderRadius: 0,
        borderBottomWidth: 1,
        borderColor: theme.colors.grey[600],
        paddingVertical: theme.sizes.spacing.sm,
        minHeight: 73,
    },
});
