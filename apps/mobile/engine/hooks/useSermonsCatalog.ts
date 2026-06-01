import { useDiscoveryHomeRails } from '@/engine/hooks/useDiscoveryHomeRails';

export const SERMONS_QUERY_KEY = ['discovery', 'home', 'catalog'] as const;

/** Flat sermon list from discovery home (all rails deduped). */
export function useSermonsCatalog() {
    const { allSermons, isLoading, error, refetch } = useDiscoveryHomeRails();

    return {
        data: allSermons.length > 0 ? allSermons : undefined,
        isLoading,
        error,
        refetch,
    };
}
