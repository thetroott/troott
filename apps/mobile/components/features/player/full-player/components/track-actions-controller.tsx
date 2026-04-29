import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Heart, Send } from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SolidIcons } from '@/assets/icons';
import type { SermonItemDTO, SermonTrackDTO } from '@/types/sermon';
import { openShareFlow } from '@/stores/app/share';
import { useCurrentIndex, useCurrentTrack, usePlayQueue } from '@/stores/player/queue';
import { useSkip } from '@/engine/hooks/useControl';
import PlaybackQueue from '@/components/features/player/playback/playback-queue';
import { BottomSheetModal, BottomSheetRef } from '@/components/ui/bottom-sheet-modal';

function mapTrackToSermonItem(track: SermonTrackDTO): SermonItemDTO {
    return {
        id: track.item?.id ?? track.id ?? null,
        title: track.title ?? track.item?.title ?? null,
        minister: track.artist ?? null,
        duration: track.duration ?? null,
        image: track.item?.image ?? null,
        sourceType: track.sourceType ?? 'stream',
        url:
            typeof track.url === 'string' || typeof track.url === 'number'
                ? track.url
                : null,
        artwork:
            typeof track.artwork === 'string' || typeof track.artwork === 'number'
                ? track.artwork
                : null,
        seriesId: track.item?.seriesId ?? null,
    };
}

export function TrackActionsController({
    track,
}: {
    track: SermonTrackDTO | null;
}) {
    const [liked, setLiked] = React.useState(false);
    const [shared, setShared] = React.useState(false);
    const [queued, setQueued] = React.useState(false);
    const queueSheetRef = React.useRef<BottomSheetRef>(null);
    const playQueue = usePlayQueue();
    const currentTrack = useCurrentTrack();
    const currentIndex = useCurrentIndex();
    const skip = useSkip();
    const feedbackTimersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

    const flashIcon = React.useCallback(
        (setter: React.Dispatch<React.SetStateAction<boolean>>, duration = 220) => {
            setter(true);
            const timer = setTimeout(() => {
                setter(false);
            }, duration);
            feedbackTimersRef.current.push(timer);
        },
        [],
    );

    React.useEffect(() => {
        return () => {
            feedbackTimersRef.current.forEach(clearTimeout);
            feedbackTimersRef.current = [];
        };
    }, []);

    if (!track) return null;

    const trackTitle = track.title || track.item?.title || 'Track Title';
    const trackMinister = track.artist ?? 'Unknown minister';

    const handleShare = React.useCallback(() => {
        flashIcon(setShared);
        openShareFlow({
            id: track.item?.id ?? track.id ?? null,
            title: trackTitle,
            minister: trackMinister,
            image: track.item?.image ?? null,
            artwork: track.artwork ?? null,
        });
    }, [flashIcon, track, trackTitle, trackMinister]);

    const nowPlaying = React.useMemo(
        () => mapTrackToSermonItem(currentTrack ?? track),
        [currentTrack, track],
    );

    const nextUpWithIndex = React.useMemo(() => {
        const startIndex =
            typeof currentIndex === 'number' && currentIndex >= 0
                ? currentIndex + 1
                : 1;
        return playQueue.slice(startIndex).map((queueTrack, idx) => ({
            item: mapTrackToSermonItem(queueTrack),
            absoluteIndex: startIndex + idx,
        }));
    }, [playQueue, currentIndex]);

    const nextUp = React.useMemo(
        () => nextUpWithIndex.map((entry) => entry.item),
        [nextUpWithIndex],
    );

    const handleOpenQueue = React.useCallback(() => {
        flashIcon(setQueued);
        queueSheetRef.current?.open();
    }, [flashIcon]);

    const handleCloseQueue = React.useCallback(() => {
        queueSheetRef.current?.close();
    }, []);

    const handlePressQueueItem = React.useCallback(
        (_item: SermonItemDTO, index: number) => {
            const target = nextUpWithIndex[index];
            if (!target) return;
            void skip(target.absoluteIndex);
            queueSheetRef.current?.close();
        },
        [nextUpWithIndex, skip],
    );

    return (
        <View style={styles.actionContainer}>
            <View style={styles.trackInfo}>
                <Text
                    color={colors.white[100]}
                    size="md"
                    weight="semiBold"
                    numberOfLines={1}
                >
                    {track.title || track.item?.title || 'Track Title'}
                </Text>
                <Text>{track.artist ?? 'Unknown minister'}</Text>
            </View>

            <View style={styles.iconsContainer}>
                <Pressable
                    onPress={() => flashIcon(setLiked)}
                    accessibilityLabel="Like Track"
                >
                    <Heart
                        color={liked ? colors.teal[500] : colors.white[100]}
                        size={28}
                    />
                </Pressable>
                <Pressable
                    onPress={handleShare}
                    accessibilityLabel="Share Track"
                >
                    <Send
                        color={shared ? colors.teal[500] : colors.white[100]}
                        size={28}
                    />
                </Pressable>
                <Pressable
                    onPress={handleOpenQueue}
                    accessibilityLabel="Queue Track"
                >
                    <SolidIcons.QueueListIcon
                        color={queued ? colors.teal[500] : colors.white[100]}
                        size={28}
                    />
                </Pressable>
            </View>

            <BottomSheetModal.Root ref={queueSheetRef}>
                <PlaybackQueue
                    nowPlaying={nowPlaying}
                    nextUp={nextUp}
                    onClose={handleCloseQueue}
                    onPressQueueItem={handlePressQueueItem}
                />
            </BottomSheetModal.Root>
        </View>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trackInfo: {
        gap: theme.sizes.spacing.sm,
        width: '50%',
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
    },
});
