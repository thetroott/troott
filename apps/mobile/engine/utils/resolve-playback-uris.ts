import { Asset } from 'expo-asset';

import type { SermonTrackDTO } from '@/types/sermon';

function mimeFromAssetExtension(ext: string): string | undefined {
    const t = ext.toLowerCase().replace(/^\./, '');
    if (t === 'mp3') return 'audio/mpeg';
    if (t === 'm4a') return 'audio/mp4';
    if (t === 'aac') return 'audio/aac';
    if (t === 'mp4' || t === 'm4v') return 'video/mp4';
    return undefined;
}

const IMAGE_EXTENSIONS = new Set([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'bmp',
    'heic',
    'heif',
]);

function isLikelyImageBundledAsset(
    uri: string,
    assetType: string | null | undefined,
): boolean {
    const ext = (assetType ?? '').toLowerCase().replace(/^\./, '');
    if (IMAGE_EXTENSIONS.has(ext)) return true;
    return /\.(jpe?g|png|gif|webp|bmp|heic|heif)(\?|#|$)/i.test(uri);
}

/**
 * Metro `http://…` URIs from `require()` audio often fail native playback (AVPlayer / ExoPlayer).
 * `expo-asset` copies the file to a stable `file://` URI and exposes the real extension for `mimeType`.
 */
export async function resolvePlaybackUrisForTrackPlayer(
    tracks: SermonTrackDTO[],
): Promise<SermonTrackDTO[]> {
    return Promise.all(
        tracks.map(async (track) => {
            if (typeof track.url !== 'number') return track;
            try {
                const asset = Asset.fromModule(track.url);
                await asset.downloadAsync();
                const uri = asset.localUri ?? asset.uri;
                if (!uri) {
                    return { ...track, url: '' };
                }
                if (isLikelyImageBundledAsset(uri, asset.type)) {
                    console.warn(
                        '[resolvePlaybackUris] refusing playback url: bundled module resolved to an image file (check catalog url vs artwork)',
                        { mediaId: track.mediaId, title: track.title, uri },
                    );
                    return { ...track, url: '' };
                }
                const mime =
                    track.mimeType ?? mimeFromAssetExtension(asset.type);
                return {
                    ...track,
                    url: uri,
                    ...(mime ? { mimeType: mime } : {}),
                };
            } catch (e) {
                console.warn(
                    '[resolvePlaybackUris] bundled asset failed',
                    track.mediaId,
                    e,
                );
                return { ...track, url: '' };
            }
        }),
    );
}
