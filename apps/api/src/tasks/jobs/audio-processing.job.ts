import { createReadStream } from 'fs';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Job, DoneCallback } from 'bull';
import { PassThrough } from 'stream';
import logger from '../../utils/logger.util';
import {
    AudioRenditionDTO,
    IAudioHLSJobDTO,
} from '@/modules/core/sermon/sermon.interface';
import audioProcessing from '@/modules/core/processes/audio-processing';
import storageService from '@/modules/platform/storage/storage.service';
import { FileType } from '@/utils/enums.util';

function mimeTypeForHlsFile(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.m3u8') {
        return 'application/vnd.apple.mpegurl';
    }
    if (ext === '.ts') {
        return 'video/mp2t';
    }
    return 'application/octet-stream';
}

const audioHLSProcessor = async (
    job: Job<IAudioHLSJobDTO>,
    done: DoneCallback,
) => {
    const { uploadId, renditions, inputStream, segmentDuration } = job.data;

    let workDir: string | undefined;
    try {
        if (!(inputStream instanceof PassThrough)) {
            throw new Error('inputStream must be a PassThrough stream');
        }

        const renditionsH: AudioRenditionDTO[] = renditions?.length
            ? renditions
            : [
                  { name: 'low', bitrate: 64, sampleRate: 44100, channels: 2 },
                  {
                      name: 'medium',
                      bitrate: 128,
                      sampleRate: 44100,
                      channels: 2,
                  },
                  {
                      name: 'high',
                      bitrate: 192,
                      sampleRate: 44100,
                      channels: 2,
                  },
              ];

        workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hls-'));

        const processResult = await audioProcessing.ProcessHLS({
            inputStream,
            renditions: renditionsH,
            outputDir: workDir,
            segmentDuration: segmentDuration ?? 6,
        });

        if (processResult.error || !processResult.data) {
            throw new Error(
                processResult.message || 'HLS processing failed',
            );
        }

        const outputs = processResult.data as Array<{
            name: string;
            path: string;
        }>;
        const uploadedFiles: unknown[] = [];

        for (const out of outputs) {
            const files = await fs.readdir(out.path);
            for (const file of files) {
                const fullPath = path.join(out.path, file);
                const st = await fs.stat(fullPath);
                if (!st.isFile()) {
                    continue;
                }
                const mimeType = mimeTypeForHlsFile(file);
                const stream = createReadStream(fullPath);
                const uploadResult = await storageService.uploadFile({
                    stream: stream as any,
                    mimeType,
                    uploadId: `${uploadId}/hls/${out.name}/${file}`,
                    info: {
                        filename: file,
                        encoding: '7bit',
                        mimeType,
                    } as any,
                    size: st.size,
                    fileType: FileType.AUDIO,
                });
                if (uploadResult.error) {
                    throw new Error(
                        uploadResult.message || 'S3 upload failed',
                    );
                }
                uploadedFiles.push(uploadResult.data);
            }
        }

        logger.log({
            data: `HLS packaged and uploaded for Job ID ${job.id}`,
            label: 'audio-hls-processor',
            type: 'success',
        });

        done(null, uploadedFiles);
    } catch (err: any) {
        logger.log({
            data: `HLS packaging failed for Job ID ${job.id}. Error: ${err.message}`,
            label: 'audio-hls-processor',
            type: 'error',
        });
        done(err);
    } finally {
        if (workDir) {
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            } catch {
                // ignore
            }
        }
    }
};

export default audioHLSProcessor;
