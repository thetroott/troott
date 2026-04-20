import { NextFunction, Request, RequestHandler, Response } from 'express';
import asyncHandler from './async.mdw';
import busboy, { FileInfo } from 'busboy';
import { IncomingHttpHeaders } from 'http';
import { PassThrough } from 'stream';
import redisMdw from './redis.mdw';
import ErrorResponse from '../utils/error.util';
import { FileFormat, FileMimeType } from '../utils/enums.util';
import { IFile, IFIleUpload } from '@/modules/shared/interfaces/interfaces.util';
import { determineFileType, genFileName } from '@/utils/helpers.util';

const acceptedMimeType = Object.values(FileMimeType);
const expectedSize = 100 * 1024 * 1024;

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
            const stream = busboy({
                headers: req.headers as IncomingHttpHeaders,
                limits: {
                    files: 10,
                    fileSize: expectedSize,
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
                let fileId = genFileName(fieldname, fileType);

                const uploadStream = new PassThrough();
                const metadataStream = new PassThrough();
                let fileSize = 0;

                file.on('data', async (chunk) => {
                    uploadStream.write(chunk);
                    metadataStream.write(chunk);
                    fileSize += chunk.length;

                    const percent = ((fileSize / expectedSize) * 100).toFixed(
                        2,
                    );

                    await redisMdw.keepData(
                        {
                            key: fileId,
                            value: { percent, fileSize },
                        },
                        900,
                    );
                });

                file.on('end', () => {
                    uploadStream.end();
                    metadataStream.end();

                    files.push({
                        fieldname,
                        stream: uploadStream,
                        metadataStream,
                        fileName: filename,
                        mimeType,
                        info,
                        size: fileSize,
                        fileType,
                        uploadId: fileId,
                    });

                    console.log(
                        `🟢 Finished streaming file: ${fileId}, size: ${fileSize} bytes`,
                    );
                });

                file.on('error', (err) => {
                    uploadStream.destroy(err);
                    metadataStream.destroy(err);
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

            if (size > expectedSize) {
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

            const uploadStream = new PassThrough();
            const metadataStream = new PassThrough();
            uploadStream.end(buffer);
            metadataStream.end(buffer);

            (req as any).files = [
                {
                    fieldname: 'base64file',
                    stream: uploadStream,
                    metadataStream,
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
