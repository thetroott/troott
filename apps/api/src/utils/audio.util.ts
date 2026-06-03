import { AudioQualityDTO } from "@/dtos/core/sermon.dto";

const allowedAudioMimes = new Set([
    // MP3
    'audio/mpeg',
    'audio/mp3',

    // WAV
    'audio/wav',
    'audio/x-wav',
    'audio/wave',

    // AAC
    'audio/aac',

    // M4A
    'audio/mp4',
    'audio/x-m4a',
    'audio/m4a',

    // CAF (iOS)
    'audio/x-caf',

    // OGG
    'audio/ogg',

    // Opus
    'audio/opus',

    // FLAC
    'audio/flac',
    'audio/x-flac',

    // WebM Audio
    'audio/webm',

    // AIFF
    'audio/aiff',
    'audio/x-aiff',
]);

const allowedImageMimes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
]);

const allowedVideoMimes = new Set(['video/mp4', 'video/webm']);

const allowedDocumentMimes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
]);
/**
 * FFmpeg `loudnorm` filter string for sermon HLS encoding.
 *
 * - **I=-16** — Target integrated loudness: **-16 LUFS** (LUFS = Loudness Units relative to Full Scale).
 * - **TP=-1.5** — Max true peak: **-1.5 dBTP** (dBTP = decibels True Peak).
 * - **LRA=11** — Target loudness range: **11 LU** (LU = Loudness Unit).
 *
 * @see https://ffmpeg.org/ffmpeg-filters.html#loudnorm
 */
const AudioLoudnessSpec = 'loudnorm=I=-16:TP=-1.5:LRA=11';


const AudioVariants: Array<AudioQualityDTO> = [
    { name: 'audio_64K', bitrate: 64, sampleRate: 44100, channels: 2 },
    { name: 'audio_128K', bitrate: 128, sampleRate: 44100, channels: 2 },
    { name: 'audio_192K', bitrate: 192, sampleRate: 44100, channels: 2 },
];

export {
    allowedAudioMimes,
    allowedDocumentMimes,
    allowedImageMimes,
    allowedVideoMimes,
    AudioLoudnessSpec,
    AudioVariants,
};