import { BaseSermonDtoSlimified, SermonItemDTO, SermonTrackDTO, SourceType } from "@/dtos/sermon.dto"
import { QueuingType } from "../../utils/enums.util"

/**
 * Maps a sermon catalog / API item to a react-native-track-player track (extended with Troott fields).
 */
export function mapDtoToTrack(
	_api: string,
	item: SermonItemDTO,
	queuingType?: QueuingType,
): SermonTrackDTO {
	void _api

	const id = item.id
	const url = item.url
	if (url === undefined || url === null || url === "") {
		console.warn(`mapDtoToTrack: missing url for sermon id ${id}`)
	}

	const duration = Math.max(0, Math.floor(item.duration ?? 0))
	const minister = item.minister ?? null
	const seriesLabel = item.seriesTitle ?? (Array.isArray(item.series) ? item.series[0] : undefined)

	const baseItem: BaseSermonDtoSlimified = {
		id,
		title: item.title ?? null,
		image: typeof item.image === "string" ? item.image : null,
		seriesId: item.seriesId ?? null,
		sourceType: (item.sourceType as SourceType) ?? "stream",
	}

	const artwork = item.image

	return {
		id,
		url: url as SermonTrackDTO["url"],
		title: item.title ?? undefined,
		album: seriesLabel,
		artist: minister ?? undefined,
		duration,
		artwork: artwork as SermonTrackDTO["artwork"],
		description: item.description ?? undefined,
		genre: item.topic ?? undefined,
		date: item.releaseDate ?? undefined,
		item: baseItem,
		sourceType: item.sourceType === "download" ? "download" : "stream",
		sessionId: undefined,
		QueuingType: queuingType ?? QueuingType.DirectlyQueued,
	} as SermonTrackDTO
}
