import { useCallback } from 'react';
import TrackPlayer from '@rntp/player';
import Toast from 'react-native-toast-message';

import api from '@/api/api';
import { useLibrarySessionEnabled } from '@/api/hooks/app/useLibrary';
import { lastPlayedToSermonItemDto } from '@/engine/state/last-played-sync';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/lib/state/network-store';
import { networkStatusTypes } from '@/api/dtos/network.dto';
import { QueuingType } from '@/api/types';

async function resolveResumePositionSec(
    sermonId: string,
    localSec: number,
    sessionEnabled: boolean,
): Promise<number> {
    if (!sessionEnabled) {
        return localSec;
    }
    try {
        const res = await api.playback.getPlaybackForSermon(sermonId);
        if (res.error || res.data == null || typeof res.data !== 'object') {
            return localSec;
        }
        const row = res.data as Record<string, unknown>;
        const serverSec =
            typeof row.positionSeconds === 'number' ? row.positionSeconds : 0;
        return Math.max(localSec, serverSec);
    } catch {
        return localSec;
    }
}

/**
 * Rebuilds a one-item queue from persisted {@link LastPlayedSummary} and seeks to last position.
 */
export function useResumeLastPlayed() {
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();
    const sessionEnabled = useLibrarySessionEnabled();

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

        const pos = await resolveResumePositionSec(
            lp.sermonId,
            lp.lastPositionSec,
            sessionEnabled,
        );
        if (pos > 0.5 && pos < (lp.durationSec || Infinity) - 0.5) {
            TrackPlayer.seekTo(pos);
        }
    }, [loadNewQueue, networkStatus, sessionEnabled]);
}
