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
    MediaStatus,
    StreamingProtocol,
    UploadStatus,
} from '@/interfaces/core/sermon.interface';
import { buildHlsMasterPlaylist } from '@/utils/hls-master.util';
import { mediaConfig, urlForMediaKey } from '@/configs/media.config';

function hlsTempRoot(): string {
    return mediaConfig.hlsWorkDir || os.tmpdir();
}

function elapsedMs(start: number): number {
    return Date.now() - start;
}

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

function sermonUploadQuery(
    uploadId: string,
    sermonId?: string | import('mongoose').Types.ObjectId,
): Record<string, unknown> {
    if (sermonId != null && String(sermonId).trim()) {
        return { _id: String(sermonId) };
    }
    return { 'item.itemId': uploadId };
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
        sermonId,
    } = job.data;

    let workDir: string | undefined;
    const jobStarted = Date.now();
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

        await Sermon.findOneAndUpdate(sermonUploadQuery(uploadId, sermonId), {
            $set: {
                status: MediaStatus.PENDING,
                'item.uploadStatus': UploadStatus.PROCESSING,
                'item.updatedAt': new Date().toISOString(),
            },
        });

        workDir = await fs.mkdtemp(path.join(hlsTempRoot(), 'hls-'));
        const ingestPath = path.join(workDir, 'ingest');
        const downloadStarted = Date.now();
        const getObj = await storageService.getObjectStream(
            sourceS3Key,
            'originals',
        );
        if (getObj.error || !getObj.stream) {
            throw new Error(getObj.message || 'Failed to open S3 object');
        }

        await pipeline(getObj.stream as Readable, createWriteStream(ingestPath));
        logger.log({
            data: `HLS ingest download uploadId=${uploadId} ms=${elapsedMs(downloadStarted)}`,
            label: 'audio-hls-processor',
            type: 'info',
        });

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
        const encodeStarted = Date.now();
        const processResult = await audioProcessing.ProcessHLS({
            inputFilePath: hlsInput,
            renditions: renditionsH,
            outputDir: packRoot,
            segmentDuration: segmentDuration ?? 6,
        });

        if (processResult.error || !processResult.data) {
            throw new Error(processResult.message || 'HLS processing failed');
        }
        logger.log({
            data: `HLS ffmpeg encode uploadId=${uploadId} ms=${elapsedMs(encodeStarted)}`,
            label: 'audio-hls-processor',
            type: 'info',
        });

        const outputs = processResult.data as Array<{
            name: string;
            path: string;
        }>;
        const uploadedFiles: unknown[] = [];
        const uploadStarted = Date.now();

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
                const objectKey = `${uploadId}/hls/${out.name}/${file}`;
                const uploadResult = await storageService.putStreamAtKey({
                    role: 'playback',
                    key: objectKey,
                    stream: stream as any,
                    mimeType,
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
        const masterKey = `${uploadId}/hls/master.m3u8`;
        const masterStream = createReadStream(masterLocal);
        const masterUpload = await storageService.putStreamAtKey({
            role: 'playback',
            key: masterKey,
            stream: masterStream as any,
            mimeType: 'application/vnd.apple.mpegurl',
            size: masterStat.size,
            fileType: FileType.AUDIO,
        });
        if (masterUpload.error) {
            throw new Error(masterUpload.message || 'Master manifest upload failed');
        }
        logger.log({
            data: `HLS S3 upload uploadId=${uploadId} ms=${elapsedMs(uploadStarted)}`,
            label: 'audio-hls-processor',
            type: 'info',
        });

        const manifestUrl = urlForMediaKey(masterKey);

        await Sermon.findOneAndUpdate(sermonUploadQuery(uploadId, sermonId), {
            $set: {
                manifestUrl,
                playbackUrl: manifestUrl,
                protocol: StreamingProtocol.HLS,
                status: MediaStatus.DRAFT,
                'item.uploadStatus': UploadStatus.COMPLETED,
                'item.updatedAt': new Date().toISOString(),
            },
        });

        logger.log({
            data: `HLS packaged uploadId=${uploadId} master=${manifestUrl} totalMs=${elapsedMs(jobStarted)}`,
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
            if (uploadId) {
                const prefix = `${uploadId}/hls/`;
                await storageService.deleteObjectsByPrefix(prefix, 'playback');
            }
        } catch {
            // best-effort cleanup
        }

        await Sermon.findOneAndUpdate(sermonUploadQuery(uploadId, sermonId), {
            $set: {
                status: MediaStatus.DRAFT,
                'item.uploadStatus': UploadStatus.FAILED,
                'item.updatedAt': new Date().toISOString(),
            },
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
