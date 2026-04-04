import { QueuingType } from "@/utils/enums.util";
import { MediaSourceInfo } from "@/utils/interface.utl";
import { RatingType, Track } from "react-native-track-player";


export type SourceType = 'stream' | 'download'

export type BaseSermonDtoSlimified = Pick<
    SermonItemDTO,
    | 'id'
    | 'title'
    | 'image'
    | 'seriesId'
    | 'sourceType'
>


export interface SermonTrackDTO extends Track {
  id: string | null
  title?: string | undefined
	album?: string | undefined
	artist?: string | undefined
	duration: number
	artwork?: string | undefined
	description?: string | undefined
	genre?: string | undefined
	date?: string | undefined
	rating?: RatingType | undefined
	isLiveStream?: boolean | undefined

  item: BaseSermonDtoSlimified
  sourceType: SourceType
  mediaSourceInfo?: MediaSourceInfo
  sessionId: string | null | undefined

  
  /**
	 * Represents the type of queuing for this song, be it that it was
	 * queued from the selection chosen, queued by the user directly, or marked
	 * to play next by the user
	 */
  QueuingType?: QueuingType | undefined
}

export interface SermonItemDTO {
  
  id: string | null ;
  sermon?: SermonItemDTO
  title?: string | null
  originalTitle?: string | null;
  minister?: string | null
  duration?: number | null;
  /**
   * Playback source: remote URL, local file URI, or React Native asset id from require().
   */
  url?: string | number | null
  image?: string | null | number
  description?: string | null
  topic?: string | null
  releaseDate?: string | null  
  size?: number;
  tags?: Array<string> | null;
  isPublic?: boolean;
  releaseYear?: number;
  shareableUrl?: string | null
  isSeries?: boolean;
  seriesTitle?: string | null
  series?: Array<string>; 
  seriesId?: string | null

  totalPlays?: number;

  sourceType: string | null


}


export enum SermonStreamType {
  Default = "default",
  Dash = "dash",
  HLS = "hls",
  SmoothStreaming = "smoothstreaming",
}


export type SermonDownload = SermonTrackDTO & {

  savedAt: string
	isAutoDownloaded: boolean
	fileSizeBytes?: number
	artworkSizeBytes?: number
	playCount?: number
	lastPlayedAt?: string

	/**
	 * Path to the downloaded file
	 *
	 * This can be undefined as it wasn't being
	 * stored originally - so this preverves
	 * backwards compatibility
	 */
	path: string | undefined

}

export type SermonDownloadProgress = {
	[url: string]: {
		progress: number
		name: string
		sermonName: string
	}
}
export type SermonDownloadProgressState = React.Dispatch<
	React.SetStateAction<SermonDownloadProgress>
>

/** Loader / catalog row shape compatible with {@link SermonItemDTO} and playback via {@link mapDtoToTrack}. */
export type ISermonTrack = SermonItemDTO
