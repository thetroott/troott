import type { SermonItemDTO } from "@/dtos/sermon.dto"

/** Maps `_data/_mock/tracks`-style rows to {@link SermonItemDTO} for the engine queue. */
export function mockSermonRowToItem(row: {
	id?: string
	title?: string
	minister?: string
	duration?: number
	image?: string | number | null
	sermon?: string | number
	url?: string | number
}): SermonItemDTO {
	return {
		id: row.id ?? null,
		title: row.title ?? null,
		minister: row.minister ?? null,
		duration: row.duration ?? null,
		image: row.image ?? null,
		url: row.url ?? row.sermon ?? null,
		sourceType: "stream",
	}
}
