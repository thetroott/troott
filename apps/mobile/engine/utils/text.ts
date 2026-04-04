import { Models } from '@/dtos/model.dto'
import { SermonItemDTO } from '@/dtos/sermon.dto'


export function getItemName(item: SermonItemDTO): string {
	return item.title ?? item.originalTitle ?? `Unknown ${getItemNamePlaceholder(item)}`
}

function getItemNamePlaceholder(item: SermonItemDTO): string {
	switch (item.sourceType) {
		case Models.Category:
			return 'Category'
		case Models.Image:
			return 'Image'
		case Models.Minister:
			return 'Minister'
		case Models.Playlist:
			return 'Playlist'
		case Models.Series:
		case Models.Sermon:
			return 'Sermon'
		case Models.Topic:
			return 'Topic'
		default:
			return 'Troott'
	}
}
