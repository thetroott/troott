import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import { pipeline } from 'stream/promises';
import { IResult } from '@/utils/interfaces.util';
import {
    MeasureLoudnessDTO,
    NormaliseAudioDTO,
    MultiBitrateDTO,
    HLSDTO,
    DASHDTO,
    FFmpegOptionsDTO,
} from '@/modules/core/sermon/sermon.interface';

class AudioProcessing {
    public async MeasureLoudness(data: MeasureLoudnessDTO): Promise<IResult> {
        const { stream } = data;
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const args = [
                '-i',
                'pipe:0',
                '-filter_complex',
                'ebur128',
                '-f',
                'null',
                '-',
            ];
            const loudnessOutput: string[] = [];

            const ffOptions: FFmpegOptionsDTO = {
                args,
                inputStream: stream,
                onData: loudnessOutput,
            };
            await this.spawnFFmpeg(ffOptions);

            result.data = this.parseLoudnessData(loudnessOutput.join(''));
            return result;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    public async NormaliseAudio(data: NormaliseAudioDTO): Promise<IResult> {
        const {
            inputStream,
            outputStream,
            targetIntegrated = -14,
            targetTruePeak = -1,
        } = data;
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const args = [
                '-i',
                'pipe:0',
                '-af',
                `loudnorm=I=${targetIntegrated}:TP=${targetTruePeak}`,
                '-f',
                'wav',
                'pipe:1',
            ];
            const ffOptions: FFmpegOptionsDTO = {
                args,
                inputStream,
                outputStream,
            };
            await this.spawnFFmpeg(ffOptions);

            result.data = { success: true };
            return result;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    public async EncodeMultiBitrate(data: MultiBitrateDTO): Promise<IResult> {
        const { inputStream, renditions, outputDir } = data;
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const inputFile = path.join(outputDir, '_mb_spool');
        try {
            fs.mkdirSync(outputDir, { recursive: true });
            await pipeline(inputStream, fs.createWriteStream(inputFile));

            const outputs: any[] = [];

            for (const preset of renditions) {
                const renditionDir = path.join(outputDir, preset.name);
                fs.mkdirSync(renditionDir, { recursive: true });

                const args = [
                    '-i',
                    inputFile,
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
                    '6',
                    '-hls_playlist_type',
                    'vod',
                    '-hls_segment_filename',
                    path.join(renditionDir, 'seg_%03d.ts'),
                    path.join(renditionDir, 'playlist.m3u8'),
                ];

                const ffOptions: FFmpegOptionsDTO = {
                    args,
                    inputFilePath: inputFile,
                };
                await this.spawnFFmpeg(ffOptions);

                outputs.push({ name: preset.name, path: renditionDir });
            }

            result.data = outputs;
            return result;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        } finally {
            try {
                if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
            } catch {
                // ignore
            }
        }
    }

    public async ProcessHLS(data: HLSDTO): Promise<IResult> {
        const {
            inputStream,
            inputFilePath,
            renditions,
            outputDir,
            segmentDuration = 6,
        } = data;
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const spooledIngest = path.join(outputDir, '_ingest');
        const externalInput = !!inputFilePath;
        const inputFile = externalInput ? inputFilePath : spooledIngest;
        let deleteSpoolAfter = !externalInput;
        try {
            if (!renditions.length) {
                result.error = true;
                result.code = 400;
                result.message = 'At least one HLS rendition is required';
                return result;
            }
            fs.mkdirSync(outputDir, { recursive: true });
            if (!externalInput) {
                if (!inputStream) {
                    result.error = true;
                    result.code = 400;
                    result.message =
                        'ProcessHLS requires inputStream or inputFilePath';
                    return result;
                }
                /** Spool upload once: multiple encodes must not reuse the same readable stream. */
                await pipeline(inputStream, fs.createWriteStream(spooledIngest));
            }
            if (!fs.existsSync(inputFile)) {
                result.error = true;
                result.code = 500;
                result.message = 'HLS input file missing';
                return result;
            }
            const outputs: { name: string; path: string }[] = [];
            for (const preset of renditions) {
                const renditionDir = path.join(outputDir, preset.name);
                fs.mkdirSync(renditionDir, { recursive: true });

                const args = [
                    '-i',
                    inputFile,
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
                    `${segmentDuration}`,
                    '-hls_playlist_type',
                    'vod',
                    '-hls_segment_filename',
                    path.join(renditionDir, 'seg_%03d.ts'),
                    path.join(renditionDir, 'playlist.m3u8'),
                ];
                const ffOptions: FFmpegOptionsDTO = {
                    args,
                    inputFilePath: inputFile,
                };
                await this.spawnFFmpeg(ffOptions);
                outputs.push({ name: preset.name, path: renditionDir });
            }
            result.data = outputs;
            return result;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message = err?.message || 'HLS processing failed';
            return result;
        } finally {
            try {
                if (deleteSpoolAfter && fs.existsSync(spooledIngest)) {
                    fs.unlinkSync(spooledIngest);
                }
            } catch {
                // ignore
            }
        }
    }

    public async ProcessDASH(data: DASHDTO): Promise<IResult> {
        const {
            inputStream,
            renditions,
            outputDir,
            segmentDuration = 6,
        } = data;
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            if (!renditions.length) {
                result.error = true;
                result.code = 400;
                result.message = 'At least one DASH rendition is required';
                return result;
            }
            const [firstR] = renditions;
            if (!firstR) {
                result.error = true;
                result.code = 400;
                result.message = 'At least one DASH rendition is required';
                return result;
            }
            fs.mkdirSync(outputDir, { recursive: true });

            const args = [
                '-i',
                'pipe:0',
                '-map',
                '0:a',
                '-c:a',
                'aac',
                '-b:a',
                `${firstR.bitrate}k`,
                '-use_template',
                '1',
                '-use_timeline',
                '1',
                '-seg_duration',
                `${segmentDuration}`,
                '-adaptation_sets',
                'id=0,streams=a',
                '-f',
                'dash',
                path.join(outputDir, 'manifest.mpd'),
            ];

            const dummyStream = new PassThrough();
            const ffOptions: FFmpegOptionsDTO = {
                args,
                inputStream,
                outputStream: dummyStream,
            };
            await this.spawnFFmpeg(ffOptions);

            result.data = { outputDir };
            return result;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message = err.message;
            return result;
        }
    }

    /**
     * FFmpeg invocation for fully specified CLI-style argument tails (e.g. loudnorm file → WAV).
     * Inputs/outputs must appear in `args`; no stdin/stdout piping from Node streams.
     */
    public async runCli(args: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const ff = spawn('ffmpeg', [
                '-hide_banner',
                '-loglevel',
                'error',
                ...args,
            ]);
            let err = '';
            ff.stderr.on('data', (chunk) => {
                err += chunk.toString();
            });
            ff.stdout.resume();
            ff.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(err || `FFmpeg exited with code ${code}`));
            });
            ff.on('error', reject);
        });
    }

    private async spawnFFmpeg(options: FFmpegOptionsDTO): Promise<void> {
        return new Promise((resolve, reject) => {
            const ff = spawn('ffmpeg', options.args);

            if (options.inputFilePath) {
                // Input is read from `-i <file>` in `args`; do not write stdin.
            } else if (options.inputStream) {
                ff.stdin.on('error', reject);
                options.inputStream.pipe(ff.stdin);
            } else {
                reject(
                    new Error(
                        'FFmpeg requires `inputStream` or `inputFilePath` context',
                    ),
                );
                return;
            }

            if (options.outputStream) {
                ff.stdout.pipe(options.outputStream);
            } else {
                ff.stdout.resume();
            }

            ff.stderr.on('data', (chunk) => {
                if (options.onData) options.onData.push(chunk.toString());
            });

            ff.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error('FFmpeg exited with code ' + code));
            });

            ff.on('error', reject);
        });
    }

    private parseLoudnessData(text: string) {
        return {
            integrated: this.extractNumber(text, 'I:'),
            loudnessRange: this.extractNumber(text, 'LRA:'),
            truePeak: this.extractNumber(text, 'TP:'),
        };
    }

    private extractNumber(text: string, key: string): number {
        const match = text.match(new RegExp(`${key}\\s*([-0-9.]+)`));
        return match?.[1] != null ? parseFloat(match[1]) : 0;
    }
}

export default new AudioProcessing();
