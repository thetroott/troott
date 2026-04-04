import { useQuery } from "@tanstack/react-query"
import { loadSermons } from "@/_data/loader"
import type { ISermonTrack } from "@/dtos/sermon.dto"

const SERMONS_CATALOG_QUERY_KEY = ["sermons"] as const

export function useSermonsCatalogQuery() {
	return useQuery<ISermonTrack[]>({
		queryKey: SERMONS_CATALOG_QUERY_KEY,
		queryFn: loadSermons,
	})
}

export { SERMONS_CATALOG_QUERY_KEY }
