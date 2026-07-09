import { randomUUID } from 'crypto';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
    CreateMultipartUploadCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import asyncHandler from '@/middlewares/async.mdw';
import ErrorResponse from '@/utils/error.util';
import { s3, AWS_BUCKETS_ORIGINALS } from '@/configs/aws.config';
import {
    S3_SERMON_AUDIO_MAX_BYTES,
} from '@/configs/s3-multipart.config';
import S3MultipartSession from '@/models/s3-multipart-session.model';
import type { IS3MultipartSessionDoc } from '@/interfaces/s3-multipart-session.interface';
import sermonService from '@/services/core/sermon.service';
import sermonMapper from '@/mappers/sermon.mapper';
import type { ISermonDoc } from '@/interfaces/core/sermon.interface';
import { FileType } from '@/interfaces/common.interface';
import {
    buildS3ObjectKey,
    genFileName,
    getS3Folder,
} from '@/utils/helpers.util';
import logger from '@/utils/logger.util';
import sermonRepository from '@/repository/core/sermon.repository';
import {
    abortS3MultipartOnAws,
    completeS3MultipartOnAws,
    listS3PartsOnAws,
    loadSessionForOwner,
} from '@/controllers/s3-multipart.storage.controller';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { S3_MULTIPART_PRESIGN_EXPIRY_SEC } from '@/configs/s3-multipart.config';

const SERMON_AUDIO_MIME_ALLOWLIST = new Set([
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'audio/x-m4a',
    'audio/mp4',
    'audio/x-caf',
]);

function jsonOk(res: Response, data: unknown, message = 'OK') {
    res.status(200).json({
        error: false,
        errors: [],
        data,
        message,
        status: 200,
    });
}

async function presignSermonPart(
    session: IS3MultipartSessionDoc,
    partNumber: number,
) {
    const command = new UploadPartCommand({
        Bucket: session.bucket,
        Key: session.s3Key,
        UploadId: session.s3UploadId,
        PartNumber: partNumber,
    });
    const url = await getSignedUrl(s3, command, {
        expiresIn: S3_MULTIPART_PRESIGN_EXPIRY_SEC,
    });
    return {
        url,
        headers: { 'Content-Type': session.contentType },
    };
}

/**
 * @route POST /api/v1/sermon/s3/multipart/create
 */
export const createSermonAudioMultipart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const { filename, contentType, contentLength } = req.body ?? {};
        const mime = String(contentType ?? '').toLowerCase();
        const size = Number(contentLength);
        const name = String(filename ?? 'audio');

        if (!mime || !Number.isFinite(size) || size <= 0) {
            return next(
                new ErrorResponse('Invalid multipart create body', 400, []),
            );
        }
        if (!SERMON_AUDIO_MIME_ALLOWLIST.has(mime)) {
            return next(
                new ErrorResponse('Unsupported sermon audio type', 400, []),
            );
        }
        if (size > S3_SERMON_AUDIO_MAX_BYTES) {
            return next(new ErrorResponse('File too large', 413, []));
        }

        const uploadId = genFileName(name, FileType.AUDIO);
        const folder = getS3Folder(mime);
        const s3Key = buildS3ObjectKey(folder, uploadId, mime, name);

        const created = await s3.send(
            new CreateMultipartUploadCommand({
                Bucket: AWS_BUCKETS_ORIGINALS,
                Key: s3Key,
                ContentType: mime,
            }),
        );

        const sessionId = randomUUID();
        await S3MultipartSession.create({
            sessionId,
            uploadId,
            s3UploadId: created.UploadId,
            s3Key,
            bucket: AWS_BUCKETS_ORIGINALS,
            ownerId: userId,
            purpose: 'sermon-audio',
            contentType: mime,
            contentLength: size,
            filename: name,
            fileType: FileType.AUDIO,
            finalized: false,
            status: 'uploading',
        });

        logger.log({
            data: `event=s3-multipart-create sessionId=${sessionId} purpose=sermon-audio`,
            label: 's3-multipart',
            type: 'info',
        });

        jsonOk(res, {
            sessionId,
            uploadId,
            key: s3Key,
            s3UploadId: created.UploadId,
            bucket: AWS_BUCKETS_ORIGINALS,
        });
    },
);

export const signSermonAudioPart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const { sessionId, partNumber } = req.body ?? {};
        const part = Number(partNumber);

        if (!sessionId || !Number.isFinite(part) || part < 1) {
            return next(new ErrorResponse('Invalid sign-part body', 400, []));
        }

        const session = await loadSessionForOwner(String(sessionId), userId);
        if (!session || session.purpose !== 'sermon-audio') {
            return next(new ErrorResponse('Session not found', 404, []));
        }

        const signed = await presignSermonPart(session, part);
        logger.log({
            data: `event=s3-multipart-sign-part sessionId=${sessionId} partNumber=${part}`,
            label: 's3-multipart',
            type: 'info',
        });
        jsonOk(res, signed);
    },
);

export const listSermonAudioParts: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const sessionId = String(req.query.sessionId ?? '');

        const session = await loadSessionForOwner(sessionId, userId);
        if (!session || session.purpose !== 'sermon-audio') {
            return next(new ErrorResponse('Session not found', 404, []));
        }

        const parts = await listS3PartsOnAws(session);
        jsonOk(res, { parts });
    },
);

export const abortSermonAudioMultipart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const sessionId = String(req.body?.sessionId ?? '');

        const session = await loadSessionForOwner(sessionId, userId);
        if (!session || session.purpose !== 'sermon-audio') {
            return next(new ErrorResponse('Session not found', 404, []));
        }
        if (session.finalized) {
            return next(new ErrorResponse('Session already completed', 409, []));
        }

        await abortS3MultipartOnAws(session);
        await S3MultipartSession.updateOne(
            { sessionId },
            { status: 'aborted' },
        );

        logger.log({
            data: `event=s3-multipart-abort sessionId=${sessionId}`,
            label: 's3-multipart',
            type: 'info',
        });

        jsonOk(res, { sessionId });
    },
);

export const completeSermonAudioMultipart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const { sessionId, parts } = req.body ?? {};

        if (!sessionId || !Array.isArray(parts) || parts.length === 0) {
            return next(
                new ErrorResponse('Invalid complete-audio body', 400, []),
            );
        }

        const session = await loadSessionForOwner(String(sessionId), userId);
        if (!session || session.purpose !== 'sermon-audio') {
            return next(new ErrorResponse('Session not found', 404, []));
        }

        if (session.finalized && session.sermonId) {
            const existing = await sermonRepository.findBySermonId(
                session.sermonId,
            );
            if (!existing.error && existing.data) {
                const response = await sermonMapper.mapSermon(
                    existing.data as ISermonDoc,
                );
                return jsonOk(res, response, 'Sermon uploaded successfully');
            }
        }

        const normalizedParts = parts.map(
            (p: { partNumber: number; etag: string }) => ({
                partNumber: Number(p.partNumber),
                etag: String(p.etag),
            }),
        );

        try {
            await completeS3MultipartOnAws(session, normalizedParts);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'S3 complete failed';
            return next(new ErrorResponse(message, 400, []));
        }

        const head = await s3.send(
            new HeadObjectCommand({
                Bucket: session.bucket,
                Key: session.s3Key,
            }),
        );

        const rawFileUrl = `https://${session.bucket}.s3.amazonaws.com/${session.s3Key}`;
        const upload = await sermonService.completeS3AudioUpload({
            uploadId: session.uploadId,
            s3Key: session.s3Key,
            mimeType: session.contentType,
            size: head.ContentLength ?? session.contentLength,
            fileType: session.fileType,
            userId,
            rawFileUrl,
        });

        if (upload.error || !upload.data) {
            logger.log({
                data: `event=s3-complete-audio-db-fail sessionId=${sessionId}`,
                label: 's3-multipart',
                type: 'error',
            });
            return next(
                new ErrorResponse(upload.message, upload.code ?? 500, []),
            );
        }

        const sermonDoc = upload.data as ISermonDoc;
        await S3MultipartSession.updateOne(
            { sessionId },
            {
                finalized: true,
                status: 'completed',
                sermonId: String(sermonDoc._id),
            },
        );

        logger.log({
            data: `event=s3-multipart-complete-audio uploadId=${session.uploadId} sermonId=${String(sermonDoc._id)} bytes=${head.ContentLength ?? 0}`,
            label: 's3-multipart',
            type: 'success',
        });

        const response = await sermonMapper.mapSermon(sermonDoc);
        jsonOk(res, response, 'Sermon uploaded successfully');
    },
);

/**
 * @route POST /api/v1/sermon/s3/multipart/complete-cover
 * Body: { sessionId, sermonId } — storage multipart must be completed first.
 */
export const completeSermonCoverMultipart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const sessionId = String(req.body?.sessionId ?? '');
        const sermonId = String(req.body?.sermonId ?? '');

        if (!sessionId || !sermonId) {
            return next(
                new ErrorResponse('sessionId and sermonId required', 400, []),
            );
        }

        const session = await loadSessionForOwner(sessionId, userId);
        if (!session || session.purpose !== 'storage-image') {
            return next(new ErrorResponse('Session not found', 404, []));
        }
        if (!session.storageComplete) {
            return next(
                new ErrorResponse(
                    'Storage multipart not complete',
                    409,
                    [],
                ),
            );
        }

        const sermonExist = await sermonRepository.findBySermonId(sermonId);
        if (sermonExist.error || !sermonExist.data) {
            return next(new ErrorResponse('Sermon not found', 404, []));
        }

        const doc = sermonExist.data as Record<string, unknown>;
        const isOwner = await sermonService.isSermonOwnedByUser(userId, doc);
        if (!isOwner) {
            return next(new ErrorResponse('Sermon not found', 404, []));
        }

        const upload = await sermonService.completeS3CoverUpload(sermonId, {
            uploadId: session.uploadId,
            s3Key: session.s3Key,
            mimeType: session.contentType,
            size: session.contentLength,
            fileType: session.fileType,
            userId,
        });

        if (upload.error || !upload.data) {
            return next(
                new ErrorResponse(upload.message, upload.code ?? 500, []),
            );
        }

        await S3MultipartSession.updateOne(
            { sessionId },
            { finalized: true, sermonId },
        );

        const response = await sermonMapper.mapSermon(
            upload.data as ISermonDoc,
        );
        jsonOk(res, response, 'Sermon image uploaded successfully');
    },
);
