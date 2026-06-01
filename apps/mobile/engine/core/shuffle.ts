import Toast from 'react-native-toast-message';
import TrackPlayer from '@rntp/player';
import { isUndefined } from 'lodash';
import type { SermonTrackDTO } from '@/api/dtos/sermon.dto';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';
import { shuffleSermonTracks } from '../helpers/helpers';
import { removeUpcomingMediaItems } from '@/engine/core/rntp-queue-helpers';

export async function handleShuffle(): Promise<SermonTrackDTO[]> {
    const currentIndex = TrackPlayer.getActiveMediaItemIndex();
    const currentTrack =
        TrackPlayer.getActiveMediaItem() as SermonTrackDTO | null;
    const playQueue = TrackPlayer.getQueue() as SermonTrackDTO[];

    if (
        !playQueue ||
        playQueue.length <= 1 ||
        currentIndex === null ||
        isUndefined(currentIndex) ||
        !currentTrack
    ) {
        Toast.show({
            text1: 'Nothing to shuffle',
            type: 'info',
        });
        return Promise.resolve([]);
    }

    usePlayerQueueStore.getState().setUnshuffledQueue([...playQueue]);

    const unusedTracks = playQueue
        .filter((_, index) => currentIndex != index)
        .map((track, index) => {
            return { track, index };
        });

    TrackPlayer.moveMediaItem(currentIndex, 0);

    removeUpcomingMediaItems();

    let newShuffledQueue: SermonTrackDTO[] = [];

    if (unusedTracks.length > 0) {
        const { shuffled: shuffledUpcoming } = shuffleSermonTracks(
            unusedTracks.map(({ track }) => track),
        );

        newShuffledQueue = shuffledUpcoming;
        console.debug(
            `Shuffled ${shuffledUpcoming.length} upcoming tracks. Current track and history preserved.`,
        );
    } else {
        if (currentTrack) {
            const otherTracks = playQueue!.filter(
                (_, index) => index !== currentIndex,
            );
            const { shuffled: shuffledOthers } =
                shuffleSermonTracks(otherTracks);

            newShuffledQueue = [
                ...shuffledOthers.slice(0, currentIndex),
                currentTrack,
                ...shuffledOthers.slice(currentIndex),
            ];

            console.debug(
                `Shuffled entire queue with current track preserved at index ${currentIndex}.`,
            );
        } else {
            const { shuffled: shuffledAll } = shuffleSermonTracks(playQueue!);

            newShuffledQueue = shuffledAll;

            console.debug(`Shuffled entire queue.`);
        }
    }

    TrackPlayer.addMediaItems(newShuffledQueue);

    return [currentTrack, ...newShuffledQueue];
}

export async function handleDeshuffle() {
    const shuffled = usePlayerQueueStore.getState().shuffled;
    const unshuffledQueue = usePlayerQueueStore.getState().unShuffledQueue;
    const currentIndex = TrackPlayer.getActiveMediaItemIndex();
    const currentTrack =
        TrackPlayer.getActiveMediaItem() as SermonTrackDTO | null;
    const playQueue = TrackPlayer.getQueue() as SermonTrackDTO[];

    if (!shuffled || !unshuffledQueue || unshuffledQueue.length === 0) return;

    if (currentIndex === null) return;

    TrackPlayer.moveMediaItem(currentIndex, 0);

    const missingQueueItems = unshuffledQueue.filter(
        (track) => track.item.id !== currentTrack?.item.id,
    );

    const newCurrentIndex = unshuffledQueue.findIndex(
        (track) => track.item.id === currentTrack?.item.id,
    );

    removeUpcomingMediaItems();

    TrackPlayer.addMediaItems(missingQueueItems);

    console.debug(
        `Moving active playing track from previous index of ${currentIndex} to ${newCurrentIndex}`,
    );
    console.debug(`Queue length is ${playQueue?.length}`);
    TrackPlayer.moveMediaItem(0, newCurrentIndex);

    console.debug(
        `Restored original app queue, ${unshuffledQueue.length} tracks. TrackPlayer queue will be updated as needed.`,
    );

    usePlayerQueueStore.getState().setUnshuffledQueue([]);
}
