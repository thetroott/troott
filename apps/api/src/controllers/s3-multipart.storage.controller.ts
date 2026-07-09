import { randomUUID } from 'crypto';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    HeadObjectCommand,
    ListPartsCommand,
    UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import asyncHandler from '@/middlewares/async.mdw';
import ErrorResponse from '@/utils/error.util';
import { s3, AWS_BUCKETS_STORAGE } from '@/configs/aws.config';
import {
    S3_MULTIPART_PRESIGN_EXPIRY_SEC,
    S3_STORAGE_MULTIPART_MAX_BYTES,
} from '@/configs/s3-multipart.config';
import S3MultipartSession from '@/models/s3-multipart-session.model';
import type { IS3MultipartSessionDoc } from '@/interfaces/s3-multipart-session.interface';
import imageMapper, { ImageDTO } from '@/dtos/storage.dto';
import { FileType } from '@/interfaces/common.interface';
import {
    buildS3ObjectKey,
    buildStoragePublicUrl,
    genFileName,
    getS3Folder,
} from '@/utils/helpers.util';
import logger from '@/utils/logger.util';

function jsonOk(res: Response, data: unknown, message = 'OK') {
    res.status(200).json({
        error: false,
        errors: [],
        data,
        message,
        status: 200,
    });
}

export async function loadS3MultipartSession(
    sessionId: string,
): Promise<IS3MultipartSessionDoc | null> {
    return S3MultipartSession.findOne({ sessionId }).lean();
}

export async function loadSessionForOwner(
    sessionId: string,
    ownerId: string,
): Promise<IS3MultipartSessionDoc | null> {
    const session = await loadS3MultipartSession(sessionId);
    if (!session || session.ownerId !== ownerId) {
        return null;
    }
    if (session.status === 'aborted') {
        return null;
    }
    return session;
}

export async function completeS3MultipartOnAws(
    session: IS3MultipartSessionDoc,
    parts: Array<{ partNumber: number; etag: string }>,
): Promise<void> {
    await s3.send(
        new CompleteMultipartUploadCommand({
            Bucket: session.bucket,
            Key: session.s3Key,
            UploadId: session.s3UploadId,
            MultipartUpload: {
                Parts: parts
                    .slice()
                    .sort((a, b) => a.partNumber - b.partNumber)
                    .map((p) => ({
                        ETag: p.etag,
                        PartNumber: p.partNumber,
                    })),
            },
        }),
    );
}

export async function abortS3MultipartOnAws(
    session: IS3MultipartSessionDoc,
): Promise<void> {
    try {
        await s3.send(
            new AbortMultipartUploadCommand({
                Bucket: session.bucket,
                Key: session.s3Key,
                UploadId: session.s3UploadId,
            }),
        );
    } catch {
        /* already aborted */
    }
}

export async function listS3PartsOnAws(session: IS3MultipartSessionDoc) {
    const out = await s3.send(
        new ListPartsCommand({
            Bucket: session.bucket,
            Key: session.s3Key,
            UploadId: session.s3UploadId,
        }),
    );
    return (out.Parts ?? []).map((p) => ({
        partNumber: p.PartNumber ?? 0,
        size: p.Size ?? 0,
        etag: p.ETag ?? '',
    }));
}

async function presignUploadPart(
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
 * @route POST /api/v1/storage/s3/multipart/create
 */
export const createStorageMultipart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const {
            filename,
            contentType,
            contentLength,
            purpose,
        } = req.body ?? {};

        const mime = String(contentType ?? '').toLowerCase();
        const size = Number(contentLength);
        const name = String(filename ?? 'file');

        if (!mime || !Number.isFinite(size) || size <= 0) {
            return next(
                new ErrorResponse('Invalid multipart create body', 400, []),
            );
        }

        const resolvedPurpose =
            purpose === 'storage-document' ? 'storage-document' : 'storage-image';

        if (resolvedPurpose === 'storage-image' && !mime.startsWith('image/')) {
            return next(new ErrorResponse('File must be an image', 400, []));
        }
        if (
            resolvedPurpose === 'storage-document' &&
            mime !== 'application/pdf'
        ) {
            return next(new ErrorResponse('File must be a PDF', 400, []));
        }
        if (size > S3_STORAGE_MULTIPART_MAX_BYTES) {
            return next(new ErrorResponse('File too large', 413, []));
        }

        const fileType =
            resolvedPurpose === 'storage-document'
                ? FileType.DOCUMENT
                : FileType.IMAGE;
        const uploadId = genFileName(name, fileType);
        const folder = getS3Folder(mime);
        const s3Key = buildS3ObjectKey(folder, uploadId, mime, name);

        const created = await s3.send(
            new CreateMultipartUploadCommand({
                Bucket: AWS_BUCKETS_STORAGE,
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
            bucket: AWS_BUCKETS_STORAGE,
            ownerId: userId,
            purpose: resolvedPurpose,
            contentType: mime,
            contentLength: size,
            filename: name,
            fileType,
            finalized: false,
            status: 'uploading',
        });

        logger.log({
            data: `event=s3-multipart-create sessionId=${sessionId} purpose=${resolvedPurpose}`,
            label: 's3-multipart',
            type: 'info',
        });

        jsonOk(res, {
            sessionId,
            uploadId,
            key: s3Key,
            s3UploadId: created.UploadId,
            bucket: AWS_BUCKETS_STORAGE,
        });
    },
);

/**
 * @route POST /api/v1/storage/s3/multipart/sign-part
 */
export const signStoragePart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const { sessionId, partNumber } = req.body ?? {};
        const part = Number(partNumber);

        if (!sessionId || !Number.isFinite(part) || part < 1) {
            return next(new ErrorResponse('Invalid sign-part body', 400, []));
        }

        const session = await loadSessionForOwner(String(sessionId), userId);
        if (!session) {
            return next(new ErrorResponse('Session not found', 404, []));
        }

        const signed = await presignUploadPart(session, part);
        logger.log({
            data: `event=s3-multipart-sign-part sessionId=${sessionId} partNumber=${part}`,
            label: 's3-multipart',
            type: 'info',
        });
        jsonOk(res, signed);
    },
);

/**
 * @route GET /api/v1/storage/s3/multipart/list-parts
 */
export const listStorageParts: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const sessionId = String(req.query.sessionId ?? '');

        if (!sessionId) {
            return next(new ErrorResponse('sessionId required', 400, []));
        }

        const session = await loadSessionForOwner(sessionId, userId);
        if (!session) {
            return next(new ErrorResponse('Session not found', 404, []));
        }

        const parts = await listS3PartsOnAws(session);
        jsonOk(res, { parts });
    },
);

/**
 * @route POST /api/v1/storage/s3/multipart/abort
 */
export const abortStorageMultipart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const sessionId = String(req.body?.sessionId ?? '');

        const session = await loadSessionForOwner(sessionId, userId);
        if (!session) {
            return next(new ErrorResponse('Session not found', 404, []));
        }
        if (session.finalized) {
            return next(new ErrorResponse('Session already completed', 409, []));
        }

        await abortS3MultipartOnAws(session);
        await S3MultipartSession.updateOne(
            { sessionId },
            { status: 'aborted', finalized: false },
        );

        logger.log({
            data: `event=s3-multipart-abort sessionId=${sessionId}`,
            label: 's3-multipart',
            type: 'info',
        });

        jsonOk(res, { sessionId });
    },
);

/**
 * @route POST /api/v1/storage/s3/multipart/complete
 */
export const completeStorageMultipart: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req as any).user?.id ?? '');
        const { sessionId, parts } = req.body ?? {};

        if (!sessionId || !Array.isArray(parts) || parts.length === 0) {
            return next(
                new ErrorResponse('Invalid complete multipart body', 400, []),
            );
        }

        const session = await loadSessionForOwner(String(sessionId), userId);
        if (!session) {
            return next(new ErrorResponse('Session not found', 404, []));
        }

        if (session.storageComplete || session.finalized) {
            const imageDTO = buildStorageImageDto(session, userId);
            return jsonOk(res, imageDTO, 'Image uploaded successfully');
        }

        const normalizedParts = parts.map(
            (p: { partNumber: number; etag: string }) => ({
                partNumber: Number(p.partNumber),
                etag: String(p.etag),
            }),
        );

        await completeS3MultipartOnAws(session, normalizedParts);

        const head = await s3.send(
            new HeadObjectCommand({
                Bucket: session.bucket,
                Key: session.s3Key,
            }),
        );

        await S3MultipartSession.updateOne(
            { sessionId },
            { storageComplete: true, status: 'completed' },
        );

        const updated = {
            ...session,
            contentLength: head.ContentLength ?? session.contentLength,
        };

        const imageDTO = buildStorageImageDto(updated, userId);
        jsonOk(res, imageDTO, 'Image uploaded successfully');
    },
);

export function buildStorageImageDto(
    session: IS3MultipartSessionDoc,
    userId: string,
): ImageDTO {
    const rawFile = buildStoragePublicUrl(session.s3Key);
    return imageMapper.mapImage(
        {
            error: false,
            code: 200,
            message: 'ok',
            data: {
                uploadId: session.uploadId,
                fileName: session.filename ?? session.uploadId,
                fileSize: session.contentLength,
                fileType: session.fileType,
                mimetype: session.contentType,
                uploadStatus: 'completed',
                s3Key: session.s3Key,
                rawFile,
                bucket: session.bucket,
            },
        },
        userId,
    );
}
