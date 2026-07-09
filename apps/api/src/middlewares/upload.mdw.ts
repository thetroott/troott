import { NextFunction, Request, RequestHandler, Response } from 'express';
import asyncHandler from './async.mdw';
import busboy, { FileInfo } from 'busboy';
import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import redisMdw from './redis.mdw';
import ErrorResponse from '../utils/error.util';
import { FileFormat, FileMimeType } from '@/interfaces/common.interface';
import { IFile, IFIleUpload } from '@/interfaces/common.interface';
import { determineFileType, genFileName } from '@/utils/helpers.util';

const acceptedMimeType = Object.values(FileMimeType);

const DEFAULT_MULTIPART_MAX_BYTES = 100 * 1024 * 1024;
const DEFAULT_SERMON_AUDIO_MAX_BYTES = 512 * 1024 * 1024;

function resolveMultipartMaxBytes(req: Request): number {
    const generic =
        Number(process.env.MULTIPART_MAX_FILE_BYTES) || DEFAULT_MULTIPART_MAX_BYTES;
    const path = `${req.originalUrl ?? ''}${req.url ?? ''}`;
    if (path.includes('/sermon/start-upload')) {
        const sermonMax =
            Number(process.env.SERMON_AUDIO_MAX_BYTES) ||
            DEFAULT_SERMON_AUDIO_MAX_BYTES;
        return Math.max(generic, sermonMax);
    }
    return generic;
}

/**
 * @name uploadHandler
 * @description Middleware to handle file uploads using busboy
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const uploadHandler: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const method = req.method.toUpperCase();
        if (!['POST', 'PUT', 'PATCH'].includes(method)) return next();

        const contentType = req.headers['content-type'];

        // Case 1: Raw file upload (multipart/form-data)
        if (contentType?.includes('multipart/form-data')) {
            const maxFileBytes = resolveMultipartMaxBytes(req);
            const stream = busboy({
                headers: req.headers as IncomingHttpHeaders,
                limits: {
                    files: 10,
                    fileSize: maxFileBytes,
                },
            });

            const files: IFile[] = [];
            const formFields: Partial<IFIleUpload> = {};

            // Initialize req.body if it doesn't exist
            if (!req.body) {
                req.body = {};
            }

            stream.on('file', (fieldname, file, info: FileInfo) => {
                const { filename, mimeType } = info;

                if (!acceptedMimeType.includes(mimeType as FileMimeType)) {
                    file.resume();
                    return next(
                        new ErrorResponse(
                            `File "${filename}" is not supported.`,
                            400,
                            [],
                        ),
                    );
                }

                const fileType = determineFileType(mimeType as FileMimeType);
                const fileId = genFileName(fieldname, fileType);
                const chunks: Buffer[] = [];
                let fileSize = 0;
                let fileLimitHit = false;

                file.on('limit', () => {
                    fileLimitHit = true;
                });

                file.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                    fileSize += chunk.length;

                    const percent = ((fileSize / maxFileBytes) * 100).toFixed(
                        2,
                    );

                    void redisMdw.keepData(
                        {
                            key: fileId,
                            value: { percent, fileSize },
                        },
                        900,
                    );
                });

                file.on('end', () => {
                    if (fileLimitHit) {
                        return next(
                            new ErrorResponse(
                                `File "${filename}" exceeds maximum size (${maxFileBytes} bytes).`,
                                413,
                                [],
                            ),
                        );
                    }
                    if (fileSize === 0) {
                        return next(
                            new ErrorResponse(
                                `File "${filename}" is empty.`,
                                400,
                                [],
                            ),
                        );
                    }

                    const buffer = Buffer.concat(chunks);
                    const uploadStream = Readable.from(buffer);

                    files.push({
                        fieldname,
                        stream: uploadStream as IFile['stream'],
                        fileName: filename,
                        mimeType,
                        info,
                        size: fileSize,
                        fileType,
                        uploadId: fileId,
                    });

                    console.log(
                        `Finished streaming file: ${fileId}, size: ${fileSize} bytes`,
                    );
                });

                file.on('error', (err) => {
                    return next(err);
                });
            });

            stream.on('field', (name, value) => {
                formFields[name as keyof IFIleUpload] = value as any;
                // Ensure req.body exists before setting properties
                if (!req.body) {
                    req.body = {};
                }
                req.body[name] = value;
            });

            stream.on('finish', () => {
                if (!files.length) {
                    return next(new ErrorResponse('No file uploaded', 400, []));
                }

                (req as any).files = files;
                (req as any).formFields = formFields;

                req.body = { ...formFields } as IFIleUpload;

                next();
            });

            stream.on('error', (err) => next(err));
            req.pipe(stream);

            return;
        }

        // Case 2: JSON OR base64
        if (contentType?.includes('application/json')) {
            const { format, base64, name, type } = req.body as IFIleUpload;

            if (format !== FileFormat.BASE64) {
                return next(
                    new ErrorResponse(
                        `Invalid json format: ${format}`,
                        400,
                        [],
                    ),
                );
            }

            if (!base64 || !type) {
                return next(
                    new ErrorResponse('Missing base64 or type', 400, []),
                );
            }

            const buffer = Buffer.from(base64, 'base64');
            const size = buffer.length;

            if (size > resolveMultipartMaxBytes(req)) {
                return next(
                    new ErrorResponse('File size exceeds limit', 400, []),
                );
            }

            const mimeMap: Record<string, FileMimeType> = {
                pdf: FileMimeType.PDF,
                jpeg: FileMimeType.JPEG,
                jpg: FileMimeType.JPEG,
                png: FileMimeType.PNG,
                webp: FileMimeType.WEBP,
                svg: FileMimeType.SVG,
            };

            const mimeType = mimeMap[type.toLowerCase()];
            if (!acceptedMimeType.includes(mimeType as FileMimeType)) {
                return next(
                    new ErrorResponse(
                        `Unsupported file type: ${mimeType}`,
                        400,
                        [],
                    ),
                );
            }

            const fileType = determineFileType(mimeType as FileMimeType);
            const fileName = genFileName(name, fileType);

            (req as any).files = [
                {
                    fieldname: 'base64file',
                    stream: Readable.from(buffer) as IFile['stream'],
                    fileName,
                    mimeType,
                    size,
                    info: {
                        filename: name,
                        mimeType: mimeType,
                        encoding: 'base64',
                    },
                } as IFile,
            ];

            return next();
        }

        return next(new ErrorResponse('Unsupported content type', 415, []));
    },
);

export default uploadHandler;
