import { useCallback } from 'react';

import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { useNetworkStatus } from '@/stores/app/network';
import type { Queue } from '@/types/queue-ref';
import { networkStatusTypes } from '@/types/network-status';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';
import { QueuingType } from '@/utils/enums.util';

type CatalogRow = Partial<ISermonTrack> & { id: string | null };

/**
 * Play a sermon from a catalog list (home mocks, loader data) using the engine queue pipeline.
 */
export function usePlayFromCatalogList(queue: Queue = 'Library') {
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    return useCallback(
        async (rows: CatalogRow[], startIndex: number) => {
            const tracklist: SermonItemDTO[] = rows.map((r) =>
                catalogRowToSermonItem(r),
            );
            const track = tracklist[startIndex];
            if (!track?.id) return;

            await loadNewQueue({
                api: undefined,
                networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
                track,
                index: startIndex,
                tracklist,
                queue,
                queuingType: QueuingType.FromSelection,
                startPlayback: true,
            });
        },
        [loadNewQueue, networkStatus, queue],
    );
}
