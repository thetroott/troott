import { SermonItemDTO } from "@/dtos/sermon.dto"
import { QueuingType } from "../../utils/enums.util"


export type Queue =
	| 'Recently Played'
	| 'Search'
	| 'Favorite Tracks'
	| 'Downloaded Tracks'
	| 'On Repeat'
	| 'Instant Mix'
	| 'Library'



export interface QueuingRequest {
	sermon: SermonItemDTO
	queuingType: QueuingType
	atIndex?: number
}
