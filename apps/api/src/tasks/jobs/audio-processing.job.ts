import type { AudioQualityDTO, IAudioHLSJobDTO } from '@/dtos/core/sermon.dto';
import { FileType } from '@/interfaces/common.interface';
import { UploadStatus } from '@/interfaces/core/sermon.interface';
import type { DoneCallback, Job } from 'bull';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import audioProcessing from '@/services/core/audio.service';
import sermonService from '@/services/core/sermon.service';
import storageService, {
    type HlsIncrementalUploader,
} from '@/services/storage.service';
import { AudioVariants } from '@/utils/audio.util';
import logger from '../../utils/logger.util';


const audioHLSProcessor = async (
    job: Job<IAudioHLSJobDTO>,
    done: DoneCallback,
) => {
    const {
        uploadId,
        sourceS3Key,
        audioQualities,
        segmentDuration,
        sermonId,
    } = job.data;

    let workDir: string | undefined;
    let uploader: HlsIncrementalUploader | undefined;
    const jobStarted = Date.now();
    const waitMs =
        typeof job.timestamp === 'number'
            ? Math.max(0, jobStarted - job.timestamp)
            : -1;

    try {
        if (
            !uploadId ||
            !sourceS3Key ||
            !audioQualities ||
            !segmentDuration ||
            !sermonId
        ) {
            throw new Error(
                'Invalid audio processing job payload: uploadId, sourceS3Key, audioQualities, segmentDuration, and sermonId are required.',
            );
        }

        if (await sermonService.checkSermonProcessingCancelled(uploadId, sermonId)) {
            logger.log({
                data: `HLS packaging skipped (cancelled) uploadId=${uploadId} jobId=${job.id}`,
                label: 'audio-hls-processor',
                type: 'info',
            });
            return done(null, { cancelled: true });
        }

        logger.log({
            data: `event=job-start queue=audio:processing uploadId=${uploadId} jobId=${job.id} waitMs=${waitMs}`,
            label: 'audio-hls-processor',
            type: 'info',
        });

        const renditionsH: AudioQualityDTO[] = audioQualities?.length
            ? audioQualities
            : AudioVariants;

        await sermonService.markSermonUploadProcessing(uploadId, sermonId);

        const segDuration = segmentDuration;
        const filterResult =
            await audioProcessing.resolveNormalizationFilter(sourceS3Key);
        if (filterResult.error || !filterResult.filter) {
            throw new Error(
                filterResult.message || 'Failed to resolve audio filter',
            );
        }
        const measureBytes = filterResult.s3GetBytes ?? 0;

        if (await sermonService.checkSermonProcessingCancelled(uploadId, sermonId)) {
            throw new Error('Sermon processing cancelled');
        }

        const hlsWorkDir =
            (process.env.HLS_WORK_DIR || '').trim() || os.tmpdir();
        workDir = await fs.mkdtemp(path.join(hlsWorkDir, 'hls-'));
        const packRoot = workDir;
        const renditionNames = renditionsH.map((r) => r.name);

        uploader = storageService.createHlsIncrementalUploader(
            uploadId,
            renditionNames,
            packRoot,
        );
        uploader.start();

        await job.progress(5);

        const encodeStarted = Date.now();
        const encodeGetObj = await storageService.getObjectStream(sourceS3Key);
        if (encodeGetObj.error || !encodeGetObj.stream) {
            throw new Error(
                encodeGetObj.message || 'Failed to open S3 object',
            );
        }
        const encodeStream = encodeGetObj.stream as Readable;
        const encodeCl = (encodeGetObj.data as { contentLength?: number })
            ?.contentLength;
        const encodeContentLength =
            typeof encodeCl === 'number' && encodeCl >= 0
                ? encodeCl
                : undefined;
        let cumulativeS3GetBytes =
            measureBytes + (encodeContentLength ?? 0);

        const encodeResult = await audioProcessing.generateHLSPlayback({
            inputStream: encodeStream,
            normalizationFilter: filterResult.filter,
            audioQualities: renditionsH,
            hlsOutputPath: packRoot,
            hlsSegmentDuration: segDuration,
        });
        if (encodeResult.error) {
            throw new Error(
                encodeResult.message || 'HLS packaging failed',
            );
        }

        if (await sermonService.checkSermonProcessingCancelled(uploadId, sermonId)) {
            throw new Error('Sermon processing cancelled');
        }

        let workDirBytesPeak = 0;
        {
            const sizeDirs: string[] = [packRoot];
            while (sizeDirs.length > 0) {
                const dir = sizeDirs.pop()!;
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        sizeDirs.push(fullPath);
                    } else if (entry.isFile()) {
                        const st = await fs.stat(fullPath);
                        workDirBytesPeak += st.size;
                    }
                }
            }
        }

        logger.log({
            data: `HLS encode uploadId=${uploadId} ms=${Date.now() - encodeStarted} s3GetBytes=${cumulativeS3GetBytes} workDirBytesPeak=${workDirBytesPeak} twoPass=${process.env.AUDIO_LOUDNORM_TWO_PASS === 'true'}`,
            label: 'audio-hls-processor',
            type: 'info',
        });

        await job.progress(85);

        const uploadStarted = Date.now();
        const uploadedFiles = await uploader.flushRemaining();

        let workDirBytesAfterUpload = 0;
        {
            const sizeDirs: string[] = [packRoot];
            while (sizeDirs.length > 0) {
                const dir = sizeDirs.pop()!;
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        sizeDirs.push(fullPath);
                    } else if (entry.isFile()) {
                        const st = await fs.stat(fullPath);
                        workDirBytesAfterUpload += st.size;
                    }
                }
            }
        }
        workDirBytesPeak = Math.max(workDirBytesPeak, workDirBytesAfterUpload);

        logger.log({
            data: `HLS segment upload uploadId=${uploadId} ms=${Date.now() - uploadStarted} workDirBytesPeak=${workDirBytesPeak}`,
            label: 'audio-hls-processor',
            type: 'info',
        });

        if (await sermonService.checkSermonProcessingCancelled(uploadId, sermonId)) {
            throw new Error('Sermon processing cancelled');
        }

        const masterLines = ['#EXTM3U', '#EXT-X-VERSION:3'];
        for (const r of renditionsH) {
            const bw = Math.round(r.bitrate * 1000);
            masterLines.push(
                `#EXT-X-STREAM-INF:BANDWIDTH=${bw},NAME=${r.name}`,
                `${r.name}/playlist.m3u8`,
            );
        }
        const masterBody = `${masterLines.join('\n')}\n`;
        const masterKey = `${uploadId}/hls/master.m3u8`;
        const masterUpload = await storageService.putStreamAtKey({
            key: masterKey,
            stream: Readable.from(Buffer.from(masterBody, 'utf8')),
            mimeType: 'application/vnd.apple.mpegurl',
            size: Buffer.byteLength(masterBody, 'utf8'),
            fileType: FileType.AUDIO,
        });
        if (masterUpload.error) {
            throw new Error(
                masterUpload.message || 'Master manifest upload failed',
            );
        }

        if (await sermonService.checkSermonProcessingCancelled(uploadId, sermonId)) {
            throw new Error('Sermon processing cancelled');
        }

        const manifestUrl = storageService.urlForPlaybackKey(masterKey);
        await sermonService.markSermonUploadCompleted(
            uploadId,
            sermonId,
            manifestUrl,
        );

        await job.progress(100);

        logger.log({
            data: `HLS packaged uploadId=${uploadId} master=${manifestUrl} totalMs=${Date.now() - jobStarted} s3GetBytes=${cumulativeS3GetBytes} workDirBytesPeak=${workDirBytesPeak} renditions=${renditionNames.length}`,
            label: 'audio-hls-processor',
            type: 'success',
        });

        done(null, uploadedFiles);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const cancelled = msg === 'Sermon processing cancelled';
        logger.log({
            data: `HLS packaging failed job=${job.id} uploadId=${uploadId}: ${msg}`,
            label: 'audio-hls-processor',
            type: cancelled ? 'info' : 'error',
        });

        try {
            if (uploadId) {
                await storageService.deleteObjectsByPrefix(`${uploadId}/hls/`);
            }
        } catch {
            // best-effort cleanup
        }

        await sermonService.markSermonUploadTerminal(
            uploadId,
            job.data.sermonId,
            cancelled ? UploadStatus.CANCELLED : UploadStatus.FAILED,
        );

        if (cancelled) {
            return done(null, { cancelled: true });
        }
        done(err instanceof Error ? err : new Error(msg));
    } finally {
        uploader?.stop();
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
