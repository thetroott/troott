import { createReadStream, createWriteStream } from 'fs';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream/promises';
import type { Readable } from 'stream';
import { Job, DoneCallback } from 'bull';
import logger from '../../utils/logger.util';
import {
    AudioRenditionDTO,
    IAudioHLSJobDTO,
} from '@/dtos/core/sermon.dto';
import audioProcessing from '@/services/core/audio.service';
import storageService from '@/services/storage.service';
import { FileType } from '@/interfaces/common.interface';
import Sermon from '@/models/core/sermon.model';
import {
    ProcessingState,
    UploadStepType,
} from '@/types/upload.enums';
import { ContentStatus } from '@/utils/enums.util';
import { buildHlsMasterPlaylist } from '@/utils/hls-master.util';
import { mediaConfig, urlForMediaKey } from '@/configs/media.config';

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
    const {
        uploadId,
        sourceS3Key,
        renditions,
        segmentDuration,
    } = job.data;

    let workDir: string | undefined;
    try {
        if (!uploadId || !sourceS3Key) {
            throw new Error('uploadId and sourceS3Key are required');
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

        await Sermon.findOneAndUpdate(
            { 'uploadSummary.uploadId': uploadId },
            {
                $set: {
                    processingStatus: ProcessingState.PROCESSING,
                    uploadState: UploadStepType.AUDIO_BITRATE_PROCESSING,
                    failedStage: '',
                    processingError: '',
                },
            },
        );

        workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hls-'));
        const ingestPath = path.join(workDir, 'ingest');
        const getObj = await storageService.getObjectStream(sourceS3Key);
        if (getObj.error || !getObj.stream) {
            throw new Error(getObj.message || 'Failed to open S3 object');
        }

        await pipeline(getObj.stream as Readable, createWriteStream(ingestPath));

        let hlsInput = ingestPath;
        if (mediaConfig.audioLoudnormBeforeHls) {
            const normPath = path.join(workDir, 'normalized.wav');
            await audioProcessing.runCli([
                '-y',
                '-i',
                ingestPath,
                '-af',
                'loudnorm=I=-16:TP=-1.5:LRA=11',
                '-ac',
                '2',
                '-f',
                'wav',
                normPath,
            ]);
            hlsInput = normPath;
        }

        const packRoot = path.join(workDir, 'package');
        const processResult = await audioProcessing.ProcessHLS({
            inputFilePath: hlsInput,
            renditions: renditionsH,
            outputDir: packRoot,
            segmentDuration: segmentDuration ?? 6,
        });

        if (processResult.error || !processResult.data) {
            throw new Error(processResult.message || 'HLS processing failed');
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
                    throw new Error(uploadResult.message || 'S3 upload failed');
                }
                uploadedFiles.push(uploadResult.data);
            }
        }

        const masterBody = buildHlsMasterPlaylist(
            renditionsH.map((r) => ({
                name: r.name,
                bitrateKbps: r.bitrate,
            })),
        );
        const masterLocal = path.join(workDir, 'master.m3u8');
        await fs.writeFile(masterLocal, masterBody, 'utf8');
        const masterStat = await fs.stat(masterLocal);
        const masterStream = createReadStream(masterLocal);
        const masterUpload = await storageService.uploadFile({
            stream: masterStream as any,
            mimeType: 'application/vnd.apple.mpegurl',
            uploadId: `${uploadId}/hls/master.m3u8`,
            info: {
                filename: 'master.m3u8',
                encoding: '7bit',
                mimeType: 'application/vnd.apple.mpegurl',
            } as any,
            size: masterStat.size,
            fileType: FileType.AUDIO,
        });
        if (masterUpload.error) {
            throw new Error(masterUpload.message || 'Master manifest upload failed');
        }

        const masterKey = `${sourceS3Key.replace(/\/$/, '')}/hls/master.m3u8`;
        const hlsMasterUrl = urlForMediaKey(masterKey);

        await Sermon.findOneAndUpdate(
            { 'uploadSummary.uploadId': uploadId },
            {
                $set: {
                    hlsMasterUrl,
                    sermonUrl: hlsMasterUrl,
                    processingStatus: ProcessingState.COMPLETED,
                    derivativesReadyAt: new Date(),
                    uploadState: UploadStepType.AUDIO_PROCESSED,
                    status: ContentStatus.DRAFT,
                    processingError: '',
                    failedStage: '',
                },
            },
        );

        logger.log({
            data: `HLS packaged uploadId=${uploadId} master=${hlsMasterUrl}`,
            label: 'audio-hls-processor',
            type: 'success',
        });

        done(null, uploadedFiles);
    } catch (err: any) {
        const msg = err?.message || String(err);
        logger.log({
            data: `HLS packaging failed job=${job.id} uploadId=${uploadId}: ${msg}`,
            label: 'audio-hls-processor',
            type: 'error',
        });

        try {
            if (uploadId && job.data.sourceS3Key) {
                const prefix = `${job.data.sourceS3Key.replace(/\/$/, '')}/hls/`;
                await storageService.deleteObjectsByPrefix(prefix);
            }
        } catch {
            // best-effort cleanup
        }

        await Sermon.findOneAndUpdate(
            { 'uploadSummary.uploadId': uploadId },
            {
                $set: {
                    processingStatus: ProcessingState.FAILED,
                    processingError: msg,
                    failedStage: 'hls-package',
                    uploadState: UploadStepType.AUDIO_BITRATE_PROCESSING,
                },
            },
        );

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
