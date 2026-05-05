import type { QueryClient } from '@tanstack/react-query';

import { QueryKeys } from '@/utils/enums.util';

/**
 * Drops in-memory + persisted TanStack entries for catalog search (anonymous or prior user).
 * Call on logout and after login success so results never bleed across accounts.
 */
export function removeCatalogSearchQueries(client: QueryClient): void {
    client.removeQueries({ queryKey: [QueryKeys.CatalogSearch] });
}
