/**
 * Mock for AWS S3 storage service
 * Prevents actual file uploads during tests
 */

import { jest } from '@jest/globals';
import { IResult, IFile } from '../../src/utils/interfaces.util';

const storageServiceMock = {
    uploadFile: jest.fn<(data: IFile) => Promise<IResult>>().mockResolvedValue({
        error: false,
        message: 'File uploaded successfully',
        code: 200,
        data: {
            url: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
            key: 'test-file.jpg',
            fileName: 'test-file.jpg',
            fileSize: 1024,
            fileType: 'image',
            mimetype: 'image/jpeg',
            uploadStatus: 'completed',
            uploadId: 'test-upload-id',
            s3Key: 'test-file.jpg',
        },
    }),
    deleteFile: jest.fn<(key: string) => Promise<IResult>>().mockResolvedValue({
        error: false,
        message: 'File deleted successfully',
        code: 200,
        data: {},
    }),
    getSignedUrl: jest
        .fn<(key: string) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Signed URL generated successfully',
            code: 200,
            data: {
                url: 'https://test-bucket.s3.amazonaws.com/test-file.jpg?signature=test',
            },
        }),
    exists: jest.fn<(key: string) => Promise<IResult>>().mockResolvedValue({
        error: false,
        message: 'File exists',
        code: 200,
        data: {
            exists: true,
        },
    }),
};

export default storageServiceMock;
