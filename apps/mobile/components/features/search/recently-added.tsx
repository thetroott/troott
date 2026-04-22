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

function mockRowToSermonItem(
    row: Partial<ISermonTrack>,
    fallbackIndex: number,
): SermonItemDTO {
    const id = row.id != null ? String(row.id) : `demo-${fallbackIndex}`;
    const url =
        row.url ??
        (typeof row.sermon === 'number' || typeof row.sermon === 'string'
            ? row.sermon
            : null);

    return {
        id,
        title: row.title ?? 'Untitled',
        minister: row.minister ?? row.artist ?? null,
        duration:
            typeof row.duration === 'number' && Number.isFinite(row.duration)
                ? row.duration
                : null,
        image: row.image ?? row.artwork ?? null,
        artwork: row.artwork ?? row.image ?? null,
        url,
        sourceType: row.sourceType ?? 'stream',
    };
}

const RecentlyAdded = () => {
    const demoTracks = useMemo(() => {
        return tracks.slice(0, 8).map((row, i) => mockRowToSermonItem(row, i));
    }, []);

    const rows = useMemo(
        () => TransformArray(demoTracks, 2) as SermonItemDTO[][],
        [demoTracks],
    );

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
                        {group.map((track, slotIndex) => {
                            const flatIndex = groupIndex * 2 + slotIndex;
                            return (
                                <SermonCard
                                    key={track.id ?? `slot-${flatIndex}`}
                                    track={track}
                                    index={flatIndex}
                                    tracklist={demoTracks}
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
});
