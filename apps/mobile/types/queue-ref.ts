import type { QueuingType } from '@/utils/enums.util';

import type { SermonItemDTO } from '@/types/sermon';

export type Queue =
    | 'Recently Played'
    | 'Search'
    | 'Favorite Tracks'
    | 'Downloaded Tracks'
    | 'On Repeat'
    | 'Instant Mix'
    | 'Library';

export interface QueuingRequest {
    sermon: SermonItemDTO;
    queuingType: QueuingType;
    atIndex?: number;
}
