import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { Readable } from 'stream';
import { IResult } from '@/interfaces/common.interface';
import {
    AudioNormalizationDTO,
    AudioPlaybackDTO,
    FFmpegOptionsDTO,
} from '@/dtos/core/sermon.dto';
import { AudioLoudnessSpec } from '@/utils/audio.util';
import storageService from '@/services/storage.service';

class AudioProcessing {
    /**
     * Runs FFmpeg loudnorm **pass 1** (measurement) on an audio stream and builds the
     * **pass 2** filter string for linear normalization.
     *
     * **Workflow**
     * 1. Read sermon audio — `inputStream` is piped to FFmpeg (`-i pipe:0`).
     * 2. Measure loudness statistics — pass 1 with `loudnorm=...:print_format=json`, output to stderr.
     * 3. Build the pass 2 loudnorm filter — append `linear=true` and measured_* fields to {@link AudioLoudnessSpec}.
     * 4. Return the measurements — numeric stats plus `audioNormalizationParameters` for HLS encode.
     *
     * Troott targets (see {@link AudioLoudnessSpec} in `@/utils/audio.util`):
     * - Integrated loudness (**I**): **-16 LUFS**
     * - True peak (**TP**): **-1.5 dBTP**
     * - Loudness range (**LRA**): **11 LU**
     *
     * **Example FFmpeg measurement JSON** (stderr, first pass):
     * ```json
     * {
     *   "input_i": "-23.4",
     *   "input_tp": "-4.2",
     *   "input_lra": "5.8",
     *   "input_thresh": "-34.1",
     *   "target_offset": "0.2"
     * }
     * ```
     *
     * **What each field answers**
     * | Question | JSON key | Returned as |
     * |----------|----------|-------------|
     * | What is the current loudness? | `input_i` | `measuredIntegratedLoudness` (LUFS) |
     * | What is the true peak? | `input_tp` | `measuredTruePeak` (dBTP) |
     * | What is the loudness range? | `input_lra` | `measuredLoudnessRange` (LU) |
     * | How much adjustment is needed? | `target_offset` | `targetOffset` (LU; gain to reach target **I**) |
     *
     * `input_thresh` is the gating threshold FFmpeg used during measurement; exposed as
     * `measuredThreshold` and included in the pass 2 filter string.
     *
     * FFmpeg is invoked with `-af loudnorm=...:print_format=json` and no audio output
     * (`-f null -`). Measurement JSON is parsed from stderr and used to construct a
     * second-pass filter with `linear=true` (use when `AUDIO_LOUDNORM_TWO_PASS=true` in the HLS job).
     *
     * @param inputStream - Readable source of the sermon audio (e.g. S3 download stream).
     *   The stream is piped to FFmpeg stdin (`pipe:0`). Must not be closed before this
     *   method resolves.
     *
     * @returns Standard {@link IResult} envelope.
     *
     * **Success** (`error: false`, `code: 200`) — `data` shape:
     * @returns {object} result.data
     * @returns {number} result.data.measuredIntegratedLoudness - Current integrated loudness (`input_i`, LUFS).
     * @returns {number} result.data.measuredTruePeak - Current true peak (`input_tp`, dBTP).
     * @returns {number} result.data.measuredLoudnessRange - Current loudness range (`input_lra`, LU).
     * @returns {number} result.data.measuredThreshold - Measurement threshold (`input_thresh`).
     * @returns {number} result.data.targetOffset - Adjustment toward target **I** (`target_offset`, LU).
     * @returns {string} result.data.audioNormalizationParameters - Full pass 2 `-af` loudnorm string for
     *   {@link generateHLSPlayback} (`normalizationFilter`).
     *
     * **Failure** (`error: true`, `code: 500`) — `message` may be:
     * - `FFmpeg loudnorm measurement output not found` — no JSON object on stderr.
     * - `FFmpeg exited with code <n>` — measure pass failed.
     * - `Loudness measure pass failed` — generic fallback.
     *
     * @example
     * ```ts
     * const measure = await audioProcessing.buildAudioNormalization(sourceStream);
     * if (measure.error) throw new Error(measure.message);
     * const filter = (measure.data as { audioNormalizationParameters: string })
     *   .audioNormalizationParameters;
     * await audioProcessing.generateHLSPlayback({
     *   inputStream: sourceStream,
     *   normalizationFilter: filter,
     *   audioQualities,
     *   hlsOutputPath: packRoot,
     *   hlsSegmentDuration: 6,
     * });
     * ```
     *
     * @see {@link AudioLoudnessSpec} — target I / TP / LRA constants.
     * @see https://ffmpeg.org/ffmpeg-filters.html#loudnorm
     */
    public async buildAudioNormalization(
        inputStream: Readable,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const stderrChunks: string[] = [];

        try {
            await this.spawnFFmpeg({
                args: [
                    '-hide_banner',
                    '-loglevel',
                    'error',
                    '-i',
                    'pipe:0',
                    '-af',
                    `${AudioLoudnessSpec}:print_format=json`,
                    '-f',
                    'null',
                    '-',
                ],
                inputStream: inputStream as any,
                onData: stderrChunks,
            });

            const stderrText = stderrChunks.join('');

            const loudnormJsonMatch = stderrText.match(/\{[\s\S]*?\}/);

            if (!loudnormJsonMatch) {
                throw new Error('FFmpeg loudnorm measurement output not found');
            }

            const loudnormMeasurement = JSON.parse(loudnormJsonMatch[0]);

            const measuredIntegratedLoudness = Number(
                loudnormMeasurement.input_i,
            );

            const measuredTruePeak = Number(loudnormMeasurement.input_tp);

            const measuredLoudnessRange = Number(loudnormMeasurement.input_lra);

            const measuredThreshold = Number(loudnormMeasurement.input_thresh);

            const targetOffset = Number(loudnormMeasurement.target_offset);

            const audioNormalizationParameters =
                `${AudioLoudnessSpec}` +
                `:linear=true` +
                `:measured_I=${measuredIntegratedLoudness}` +
                `:measured_TP=${measuredTruePeak}` +
                `:measured_LRA=${measuredLoudnessRange}` +
                `:measured_thresh=${measuredThreshold}` +
                `:target_offset=${targetOffset}`;

            const output: AudioNormalizationDTO = {
                measuredIntegratedLoudness,
                measuredTruePeak,
                measuredLoudnessRange,
                measuredThreshold,
                targetOffset,
                audioNormalizationParameters,
            };

            result.data = output;
            return result;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message = err?.message || 'Loudness measure pass failed';
            return result;
        }
    }

    /**
     * Encodes **one** sermon audio stream into **multiple** HLS renditions in a **single** FFmpeg process.
     *
     * **What this does (one pass, many outputs)**
     * - Takes **one** audio stream (`inputStream` → FFmpeg `-i pipe:0`).
     * - Applies **one** audio filter chain (`-af`, usually loudnorm from {@link buildAudioNormalization}).
     * - Spawns **one** FFmpeg child process via {@link spawnFFmpeg}.
     * - Produces **multiple** encoded outputs — one per entry in `audioQualities`.
     * - Each output is an **HLS VOD** rendition: `playlist.m3u8` + `seg_%03d.ts` segments.
     * - Stores each rendition under its own folder under `hlsOutputPath`.
     *
     * **Workflow**
     * 1. FFmpeg reads the stream from stdin.
     * 2. Applies `normalizationFilter` (e.g. `loudnorm=I=-16:...:linear=true:measured_*=...`).
     * 3. Encodes multiple outputs — for each preset: `-map 0:a`, AAC at `bitrate` / `sampleRate` / `channels`.
     * 4. Writes multiple folders — `{hlsOutputPath}/{preset.name}/`.
     * 5. Generates playlists and segments — `playlist.m3u8`, `seg_000.ts`, `seg_001.ts`, … (`hlsSegmentDuration` seconds).
     *
     * **Per-rendition layout** (example `packRoot = /tmp/hls-abc`, presets `low` / `medium` / `high`):
     * ```text
     * packRoot/
     *   low/playlist.m3u8
     *   low/seg_000.ts
     *   low/seg_001.ts
     *   medium/playlist.m3u8
     *   medium/seg_000.ts
     *   high/playlist.m3u8
     *   high/seg_000.ts
     * ```
     *
     * The Bull worker (`audio-processing.job`) typically uploads these files to the playback bucket and
     * writes `manifestUrl` / `playbackUrl` on the sermon document. Segment files on disk are ephemeral
     * unless uploaded by the job.
     *
     * @param data - {@link AudioPlaybackDTO}
     * @param data.inputStream - Readable sermon source (same stream as measure pass when two-pass loudnorm is enabled).
     * @param data.normalizationFilter - Full `-af` string (required). Use `audioNormalizationParameters` from
     *   {@link buildAudioNormalization}, or {@link AudioLoudnessSpec} for single-pass encode.
     * @param data.audioQualities - Rendition presets (`name`, `bitrate` kbps, `sampleRate`, `channels`). Often
     *   from `AudioVariants` in `@/utils/audio.util`.
     * @param data.hlsOutputPath - Root directory for all rendition folders (created if missing).
     * @param data.hlsSegmentDuration - HLS segment length in seconds (`-hls_time`; default **6** when omitted).
     *
     * @returns Standard {@link IResult} envelope.
     *
     * **Success** (`error: false`, `code: 200`) — `data` is an array of:
     * @returns {Array<{ name: string; path: string }>} result.data - One entry per rendition;
     *   `path` is `{hlsOutputPath}/{name}` (folder containing `playlist.m3u8` and segments).
     *
     * **Failure**
     * - `code: 400` — missing `normalizationFilter` or empty `audioQualities`.
     * - `code: 500` — FFmpeg non-zero exit (`HLS processing failed` or `FFmpeg exited with code N`).
     *
     * @example
     * ```ts
     * const stream = await openOriginalsStream(sourceS3Key);
     * const norm = await audioProcessing.buildAudioNormalization(stream);
     * if (norm.error) throw new Error(norm.message);
     *
     * const hls = await audioProcessing.generateHLSPlayback({
     *   inputStream: stream,
     *   normalizationFilter: (norm.data as AudioNormalizationDTO)
     *     .audioNormalizationParameters,
     *   audioQualities: AudioVariants,
     *   hlsOutputPath: '/tmp/hls-pack',
     *   hlsSegmentDuration: 6,
     * });
     * ```
     *
     * @see {@link buildAudioNormalization} — loudnorm pass 1 + pass 2 filter string.
     * @see https://ffmpeg.org/ffmpeg-formats.html#hls-2
     */
    public async generateHLSPlayback(data: AudioPlaybackDTO): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const {
            inputStream,
            normalizationFilter,
            audioQualities,
            hlsOutputPath,
            hlsSegmentDuration = 6,
        } = data;

        let filter = normalizationFilter?.trim();

        if (!filter) {
            const normaliseAudio = await this.buildAudioNormalization(
                inputStream,
            );

            if (normaliseAudio.error) {
                return normaliseAudio;
            }

            const built = (normaliseAudio.data as AudioNormalizationDTO)
                ?.audioNormalizationParameters;

            if (!built?.trim()) {
                result.error = true;
                result.code = 500;
                result.message = 'Failed to normalise audio';
                return result;
            }

            filter = built;
        }

        if (!audioQualities.length) {
            result.error = true;
            result.code = 400;
            result.message = 'At least one HLS rendition is required';
            return result;
        }

        try {
            fs.mkdirSync(hlsOutputPath, { recursive: true });

            const args: Array<string> = [
                '-hide_banner',
                '-loglevel',
                'error',
                '-i',
                'pipe:0',
                '-af',
                filter,
            ];

            for (const preset of audioQualities) {

                const outputDir = path.join(hlsOutputPath, preset.name);
                fs.mkdirSync(outputDir, { recursive: true });

                const segmentPattern = path.join(outputDir, 'seg_%03d.ts');
                const playlistPath = path.join(outputDir, 'playlist.m3u8');

                args.push(
                    '-map',
                    '0:a',
                    '-c:a',
                    'aac',
                    '-b:a',
                    `${preset.bitrate}k`,
                    '-ar',
                    `${preset.sampleRate}`,
                    '-ac',
                    `${preset.channels}`,
                    '-f',
                    'hls',
                    '-hls_time',
                    `${hlsSegmentDuration}`,
                    '-hls_playlist_type',
                    'vod',
                    '-hls_segment_filename',
                    segmentPattern,
                    playlistPath,
                );
            }

            await this.spawnFFmpeg({
                args,
                inputStream: inputStream as any,
            });

            result.data = audioQualities.map((preset) => ({
                name: preset.name,
                path: path.join(hlsOutputPath, preset.name),
            }));

            return result;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message = err?.message || 'HLS processing failed';
            return result;
        }
    }

    /**
     * Loudnorm filter for HLS encode: single-pass {@link AudioLoudnessSpec}, or two-pass measure via S3 stream.
     */
    public async resolveNormalizationFilter(sourceS3Key: string): Promise<
        IResult & { filter?: string; s3GetBytes?: number }
    > {
        const twoPass = process.env.AUDIO_LOUDNORM_TWO_PASS === 'true';
        if (!twoPass) {
            return {
                error: false,
                code: 200,
                message: '',
                data: {},
                filter: AudioLoudnessSpec,
                s3GetBytes: 0,
            };
        }

        const getObj = await storageService.getObjectStream(sourceS3Key);
        if (getObj.error || !getObj.stream) {
            return {
                error: true,
                code: 500,
                message: getObj.message || 'Failed to open S3 object',
                data: {},
            };
        }

        const contentLength =
            typeof (getObj.data as { contentLength?: number })?.contentLength ===
            'number'
                ? (getObj.data as { contentLength: number }).contentLength
                : 0;

        const measure = await this.buildAudioNormalization(
            getObj.stream as Readable,
        );
        if (measure.error) {
            return measure;
        }

        const params = (measure.data as AudioNormalizationDTO)
            ?.audioNormalizationParameters;
        if (!params?.trim()) {
            return {
                error: true,
                code: 500,
                message: 'Failed to normalise audio',
                data: {},
            };
        }

        return {
            error: false,
            code: 200,
            message: '',
            data: measure.data,
            filter: params,
            s3GetBytes: contentLength,
        };
    }

    /**
     * Spawns a single `ffmpeg` process, pipes `inputStream` to stdin, and optionally collects stderr.
     * Used by {@link buildAudioNormalization} (measure pass) and {@link generateHLSPlayback} (encode pass).
     *
     * @param options - {@link FFmpegOptionsDTO}
     * @throws Error when `inputStream` is missing or FFmpeg exits with non-zero code.
     */
    private async spawnFFmpeg(options: FFmpegOptionsDTO): Promise<void> {
        return new Promise((resolve, reject) => {
            const ff = spawn('ffmpeg', options.args);

            if (!options.inputStream) {
                reject(new Error('FFmpeg requires `inputStream`'));
                return;
            }

            ff.stdin.on('error', reject);
            options.inputStream.pipe(ff.stdin);

            if (options.outputStream) {
                ff.stdout.pipe(options.outputStream);
            } else {
                ff.stdout.resume();
            }

            ff.stderr.on('data', (chunk) => {
                if (options.onData) {
                    options.onData.push(chunk.toString());
                }
            });

            ff.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });

            ff.on('error', reject);
        });
    }
}

export default new AudioProcessing();
