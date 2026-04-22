import { useCallback } from 'react';
import TrackPlayer from '@rntp/player';
import Toast from 'react-native-toast-message';

import { lastPlayedToSermonItemDto } from '@/engine/state/last-played-sync';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/stores/app/network';
import { networkStatusTypes } from '@/types/network-status';
import { QueuingType } from '@/utils/enums.util';

/**
 * Rebuilds a one-item queue from persisted {@link LastPlayedSummary} and seeks to last position.
 */
export function useResumeLastPlayed() {
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    return useCallback(async () => {
        const lp = usePlayerQueueStore.getState().lastPlayed;
        if (!lp?.sermonId || !lp.streamUrl) {
            Toast.show({
                text1: 'Cannot resume',
                text2: 'No saved playback URL for this sermon.',
                type: 'error',
            });
            return;
        }

        const item = lastPlayedToSermonItemDto(lp);
        await loadNewQueue({
            api: undefined,
            networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
            track: item,
            index: 0,
            tracklist: [item],
            queue: 'Recently Played',
            queuingType: QueuingType.FromSelection,
            startPlayback: true,
            autoplayPreferMinister: lp.artist,
        });

        const pos = lp.lastPositionSec;
        if (pos > 0.5 && pos < (lp.durationSec || Infinity) - 0.5) {
            TrackPlayer.seekTo(pos);
        }
    }, [loadNewQueue, networkStatus]);
}
