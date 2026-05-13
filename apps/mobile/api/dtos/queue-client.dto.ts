/**
 * Client-side queue UX types (origin labels, local queuing requests).
 * Not part of the REST contract; used by the player engine and UI.
 */
import type { QueuingType } from '@/utils/enums.util';

import type { SermonItemDTO } from './sermon.dto';

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
