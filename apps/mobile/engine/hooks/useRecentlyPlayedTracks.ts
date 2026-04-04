import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * Stub hook for recently played tracks. Replace with real API when backend is ready.
 */
export function useRecentlyPlayedTracks() {
  return useInfiniteQuery({
    queryKey: ["recently-played-tracks"],
    queryFn: async () => ({ pages: [], pageParams: [] }),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
  });
}
