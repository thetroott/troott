import React, { useCallback } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/lib/state/network-store';
import { networkStatusTypes } from '@/api/dtos/network.dto';
import { QueuingType } from '@/api/types';

const CARD_SIZE = 148;

function artworkSource(track: SermonItemDTO): ImageSourcePropType | null {
    const { image, artwork } = track;
    if (typeof image === 'number') return image;
    if (typeof artwork === 'number') return artwork;
    const uri =
        (typeof image === 'string' && image.length > 0 ? image : null) ??
        (typeof artwork === 'string' && artwork.length > 0 ? artwork : null);
    return uri ? { uri } : null;
}

export type TopicMostStreamedSectionProps = {
    sermons: SermonItemDTO[];
};

/**
 * Figma topic hub: horizontal square art + title + "Sermon • minister" (Search-01 / Faith frame).
 */
export default function TopicMostStreamedSection({
    sermons,
}: TopicMostStreamedSectionProps) {
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    const onPressTrack = useCallback(
        (track: SermonItemDTO, index: number) => {
            if (track.id == null) return;
            void loadNewQueue({
                api: undefined,
                networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
                track,
                index,
                tracklist: sermons,
                queue: 'Search',
                queuingType: QueuingType.FromSelection,
                startPlayback: true,
            });
        },
        [loadNewQueue, networkStatus, sermons],
    );

    if (sermons.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                    Most Streamed
                </Text>
                <Pressable
                    style={styles.seeMore}
                    onPress={() => router.push('/see-more/sermons-for-you')}
                    accessibilityRole="button"
                    accessibilityLabel="See more streamed sermons"
                >
                    <Text size="sm" color={theme.colors.grey[100]}>
                        See More
                    </Text>
                </Pressable>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                {sermons.map((track, index) => {
                    const src = artworkSource(track);
                    return (
                        <Pressable
                            key={track.id ?? `most-streamed-${index}`}
                            style={styles.card}
                            onPress={() => onPressTrack(track, index)}
                            accessibilityRole="button"
                            accessibilityLabel={track.title ?? 'Sermon'}
                        >
                            {src ? (
                                <Image
                                    source={src}
                                    style={styles.image}
                                    accessibilityIgnoresInvertColors
                                />
                            ) : (
                                <View style={[styles.image, styles.imagePlaceholder]} />
                            )}
                            <Text
                                size="sm"
                                weight="medium"
                                color={theme.colors.white[50]}
                                numberOfLines={2}
                            >
                                {track.title ?? 'Untitled'}
                            </Text>
                            <Text
                                size="xs"
                                color={theme.colors.grey[300]}
                                numberOfLines={1}
                            >
                                {`Sermon • ${track.minister ?? 'Unknown'}`}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: theme.sizes.spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    seeMore: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingVertical: theme.sizes.spacing.xs,
        borderRadius: theme.sizes.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.grey[400],
    },
    row: {
        gap: theme.sizes.spacing.base,
        paddingRight: theme.sizes.spacing.base,
    },
    card: {
        width: CARD_SIZE,
        gap: theme.sizes.spacing.sm,
    },
    image: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: theme.sizes.radius.sm,
    },
    imagePlaceholder: {
        backgroundColor: theme.colors.grey[700],
    },
});
