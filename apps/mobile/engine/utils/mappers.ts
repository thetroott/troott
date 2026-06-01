import { Image } from 'react-native';
import type { SourceType, SermonItemDTO, SermonTrackDTO } from '@/api/dtos/sermon.dto';
import { QueuingType } from '@/api/types';
import { resolveCanonicalPlaybackUrl } from './library-map';
import { getAudioCache } from './offline';
import { queryClient } from '@/api/services/query-client';
import { MediaInfoQueryKey } from '@/engine/queries/queries';

/** iOS often fails "Cannot Open" with raw `require()` ids; pass a resolved `file://` URI when possible. */
function resolveBundledMediaUrl(
    url: string | number | null | undefined,
): string | number {
    if (url == null || url === '') return '';
    if (typeof url === 'number') {
        const src = Image.resolveAssetSource(url);
        if (src?.uri) return src.uri;
        return url;
    }
    return url;
}

function guessMimeType(
    url: string | number | null | undefined,
): string | undefined {
    if (typeof url !== 'string') return undefined;
    const u = url.toLowerCase();
    if (u.includes('.mp4') || u.includes('.m4v')) return 'video/mp4';
    if (u.includes('.mp3')) return 'audio/mpeg';
    if (u.includes('.m4a')) return 'audio/mp4';
    if (u.includes('.aac')) return 'audio/aac';
    return undefined;
}

function resolveDtoPlaybackUrl(item: SermonItemDTO): string | number | '' {
    const ext = item as SermonItemDTO & {
        url?: string | number | null;
        playbackUrl?: string | null;
        manifestUrl?: string | null;
        item?: { item?: string | null };
    };
    if (ext.url != null && ext.url !== '') {
        return ext.url;
    }
    const canonical = resolveCanonicalPlaybackUrl(
        ext as unknown as Record<string, unknown>,
    );
    return canonical ?? '';
}

function isProbablyImageFileUrl(url: string): boolean {
    return /\.(jpe?g|png|gif|webp|bmp|heic|heif)(\?|#|$)/i.test(url);
}

/**
 * A mapper function that can be used to get a RNTP {@link Track} compliant object
 * from a Jellyfin server {@link BaseItemDto}. Applies a queuing type to the track
 * object so that it can be referenced later on for determining where to place
 * the track in the queue
 *
 * @param item The {@link BaseItemDto} of the track
 * @param queuingType The type of queuing we are performing
 * @param downloadQuality The quality to use for downloads (used only when saving files)
 * @param streamingQuality The quality to use for streaming (used for playback URLs)
 * @returns A {@link SermonTrackDTO}, which represents a Jellyfin library track queued in the {@link TrackPlayer}
 */
export function mapDtoToTrack(
    api: string,
    item: SermonItemDTO,
    //deviceProfile: DeviceProfile,
    queuingType?: QueuingType,
): SermonTrackDTO {
    const downloadedTracks = getAudioCache();
    const downloads = downloadedTracks.filter(
        (download) => download.item.id === item.id,
    );

    // const mediaInfo = queryClient.getQueryData(
    // 	MediaInfoQueryKey({ api: string , itemId: item.id }),
    // ) as PlaybackInfoResponse | undefined

    // let trackMediaInfo: TrackMediaInfo

    // // Prioritize downloads over streaming to save bandwidth
    // if (downloads.length > 0 && downloads[0].path)
    // 	trackMediaInfo = buildDownloadedTrack(downloads[0])
    // /**
    //  * Prioritize transcoding over direct play
    //  * so that unsupported codecs playback properly
    //  *
    //  * (i.e. ALAC audio on Android)
    //  */ else if (mediaInfo?.MediaSources && mediaInfo.MediaSources[0].TranscodingUrl) {
    // 	trackMediaInfo = buildTranscodedTrack(
    // 		api,
    // 		item,
    // 		mediaInfo!.MediaSources![0],
    // 		mediaInfo?.PlaySessionId,
    // 	)
    // } else
    // 	trackMediaInfo = {
    // 		url: buildAudioApiUrl(api, item, deviceProfile),
    // 		image: item.AlbumId
    // 			? getImageApi(api).getItemImageUrlById(item.AlbumId, ImageType.Primary)
    // 			: undefined,
    // 		duration: convertRunTimeTicksToSeconds(item.RunTimeTicks!),
    // 		item,
    // 		sessionId: mediaInfo?.PlaySessionId,
    // 		mediaSourceInfo:
    // 			mediaInfo && mediaInfo.MediaSources ? mediaInfo.MediaSources[0] : undefined,
    // 		sourceType: 'stream',
    // 		type: TrackType.Default,
    // 	}

    // // Only include headers when we have an API token (streaming cases). For downloaded tracks it's not needed.
    // const headers = (api as Api | undefined)?.accessToken
    // 	? { 'X-Emby-Token': (api as Api).accessToken }
    // 	: undefined

    const ext = item as SermonItemDTO & {
        url?: string | number | null;
        artwork?: string | number | null;
    };

    const playbackUrl = resolveDtoPlaybackUrl(item);
    const cover = ext.artwork ?? item.image;
    const mediaId = String(item.id ?? playbackUrl);

    /** Keep `require()` ids as numbers so {@link resolvePlaybackUrisForTrackPlayer} can use `expo-asset`. */
    let resolvedUrl: string | number =
        typeof playbackUrl === 'number'
            ? playbackUrl
            : resolveBundledMediaUrl(
                  typeof playbackUrl === 'string' ? playbackUrl : '',
              );

    if (
        typeof resolvedUrl === 'string' &&
        resolvedUrl.length > 0 &&
        isProbablyImageFileUrl(resolvedUrl)
    ) {
        console.warn(
            '[mapDtoToTrack] playback url looks like an image file; omitting',
            item.id,
            resolvedUrl,
        );
        resolvedUrl = '';
    }

    const artworkUrl =
        typeof cover === 'string'
            ? cover
            : typeof cover === 'number'
              ? cover
              : undefined;

    const resolvedArtwork =
        typeof artworkUrl === 'number'
            ? resolveBundledMediaUrl(artworkUrl)
            : artworkUrl;

    const mimeType =
        typeof resolvedUrl === 'string'
            ? guessMimeType(resolvedUrl)
            : undefined;

    return {
        mediaId,
        id: mediaId,
        url: resolvedUrl as SermonTrackDTO['url'],
        title: item.title ?? undefined,
        albumTitle:
            item.seriesTitle ??
            (Array.isArray(item.series) ? item.series[0] : undefined),
        album:
            item.seriesTitle ??
            (Array.isArray(item.series) ? item.series[0] : undefined),
        artist: item.minister ?? undefined,
        duration: item.duration ?? 0,
        artworkUrl: resolvedArtwork as SermonTrackDTO['artworkUrl'],
        artwork: resolvedArtwork as SermonTrackDTO['artwork'],
        ...(mimeType ? { mimeType } : {}),
        item: {
            id: item.id,
            title: item.title,
            image:
                item.image != null &&
                (typeof item.image === 'string' ||
                    typeof item.image === 'number')
                    ? item.image
                    : null,
            seriesId: item.seriesId ?? null,
            sourceType: (item.sourceType ?? 'stream') as SourceType,
        },
        sourceType: item.sourceType === 'download' ? 'download' : 'stream',
        sessionId: null,
        QueuingType: queuingType ?? QueuingType.DirectlyQueued,
    } as SermonTrackDTO;
}
