import { useQuery } from '@tanstack/react-query';
import { loadSermons } from '@/_data/loader';

export function useSermonsCatalog() {
    return useQuery({
        queryKey: ['sermons'],
        queryFn: loadSermons,
    });
}
