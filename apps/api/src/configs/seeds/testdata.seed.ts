// import { spawn } from 'child_process';
// import { PassThrough } from 'stream';
// import fs from 'fs';
// import path from 'path';
// import { IResult } from '@/interfaces/common.interface';
// import { AudioPlaybackDTO } from '@/dtos/core/sermon.dto';
// import { AudioLoudnessSpec } from '@/utils/audio.util';

// class AudioProcessing {
//     public async generateHLSPlayback(data: AudioPlaybackDTO): Promise<IResult> {
//         const {
//             inputStream,
//             audioQualities,
//             hlsOutputPath,
//             hlsSegmentDuration = 6,
//         } = data;

//         if (!audioQualities.length) {
//             return {
//                 error: true,
//                 code: 400,
//                 message: 'At least one rendition required',
//                 data: {},
//             };
//         }

//         fs.mkdirSync(hlsOutputPath, { recursive: true });

//         const { streamA, streamB } = this.cloneStream(inputStream);

//         const normalization = await this.buildAudioNormalization(streamA);
//         if (normalization.error) return normalization;

//         const filter = (normalization.data as any).audioNormalizationParameters;

//         const tasks = audioQualities.map((q) =>
//             this.runHLSWorker({
//                 stream: streamB,
//                 filter,
//                 quality: q,
//                 outputDir: path.join(hlsOutputPath, q.name),
//                 segmentDuration: hlsSegmentDuration,
//             }),
//         );

//         const outputs = await Promise.all(tasks);

//         return {
//             error: false,
//             code: 200,
//             message: '',
//             data: outputs,
//         };
//     }

//     private cloneStream(input: any) {
//         const streamA = new PassThrough();
//         const streamB = new PassThrough();

//         input.pipe(streamA);
//         input.pipe(streamB);

//         return { streamA, streamB };
//     }

//     private async buildAudioNormalization(stream: any): Promise<IResult> {
//         const stderr: string[] = [];

//         await this.spawnFFmpeg({
//             args: [
//                 '-hide_banner',
//                 '-loglevel',
//                 'error',
//                 '-i',
//                 'pipe:0',
//                 '-af',
//                 `${AudioLoudnessSpec}:print_format=json`,
//                 '-f',
//                 '-',
//             ],
//             inputStream: stream,
//             onData: stderr,
//         });

//         const match = stderr.join('').match(/\{[\s\S]*?\}/);
//         if (!match) throw new Error('loudnorm failed');

//         const j = JSON.parse(match[0]);

//         return {
//             error: false,
//             code: 200,
//             message: '',
//             data: {
//                 audioNormalizationParameters:
//                     `${AudioLoudnessSpec}` +
//                     `:linear=true` +
//                     `:measured_I=${Number(j.input_i)}` +
//                     `:measured_TP=${Number(j.input_tp)}` +
//                     `:measured_LRA=${Number(j.input_lra)}` +
//                     `:measured_thresh=${Number(j.input_thresh)}` +
//                     `:target_offset=${Number(j.target_offset)}`,
//             },
//         };
//     }

//     private async runHLSWorker(params: any): Promise<any> {
//         const { stream, filter, quality, outputDir, segmentDuration } = params;

//         fs.mkdirSync(outputDir, { recursive: true });

//         return new Promise((resolve, reject) => {
//             const ff = spawn('ffmpeg', [
//                 '-hide_banner',
//                 '-loglevel',
//                 'error',
//                 '-i',
//                 'pipe:0',
//                 '-af',
//                 filter,
//                 '-map',
//                 '0:a',
//                 '-c:a',
//                 'aac',
//                 '-b:a',
//                 `${quality.bitrate}k`,
//                 '-ar',
//                 `${quality.sampleRate}`,
//                 '-ac',
//                 `${quality.channels}`,
//                 '-f',
//                 'hls',
//                 '-hls_time',
//                 `${segmentDuration}`,
//                 '-hls_playlist_type',
//                 'vod',
//                 '-hls_segment_filename',
//                 path.join(outputDir, 'seg_%03d.ts'),
//                 path.join(outputDir, 'playlist.m3u8'),
//             ]);

//             stream.pipe(ff.stdin);

//             ff.on('close', (c) => {
//                 if (c === 0) resolve({ name: quality.name, path: outputDir });
//                 else reject(new Error(`ffmpeg failed ${c}`));
//             });

//             ff.on('error', reject);
//         });
//     }

//     private async spawnFFmpeg(options: any): Promise<void> {
//         return new Promise((resolve, reject) => {
//             const ff = spawn('ffmpeg', options.args);

//             if (options.inputStream) {
//                 options.inputStream.pipe(ff.stdin);
//             }

//             ff.stderr.on('data', (d) => options.onData?.push(d.toString()));

//             ff.on('close', (c) => (c === 0 ? resolve() : reject(new Error(`ffmpeg ${c}`))));
//             ff.on('error', reject);
//         });
//     }
// }

// export default new AudioProcessing();

// let filter = normalizationFilter?.trim();

//             if (!filter) {
//                 const normaliseAudio = await this.buildAudioNormalization(inputStream);

//                 if (normaliseAudio.error) return normaliseAudio;

//                 const normalizationFilter = (normaliseAudio.data as any)
//                     .audioNormalizationParameters;

//                 if (!normalizationFilter) {
//                     result.error = true;
//                     result.code = 500;
//                     result.message = 'Failed to normalise audio';
//                     return result;
//                 }

//                 filter = normalizationFilter;
//             }
