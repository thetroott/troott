import {
    buildS3ObjectKey,
    buildStorageImageUrl,
    buildStoragePublicUrl,
    extensionFromMimeType,
    normalizeStorageReferenceToS3Key,
    stripUrlQueryAndHash,
    toStoragePublicUrl,
} from '@/utils/helpers.util';

describe('helpers.util storage CDN URLs', () => {
    const prev = process.env.CLOUDFRONT_STORAGE_URL;
    const prevEnv = process.env.NODE_ENV;
    const prevBucket = process.env.AWS_STORAGE_BUCKET;
    const prevRegion = process.env.AWS_REGION;
    const prevKey = process.env.AWS_ACCESS_KEY_ID;
    const prevSecret = process.env.AWS_SECRET_ACCESS_KEY;

    beforeAll(() => {
        process.env.NODE_ENV = 'development';
        process.env.AWS_STORAGE_BUCKET = 'troott-storage';
        process.env.AWS_REGION = 'eu-central-1';
        process.env.AWS_ACCESS_KEY_ID = 'test-key';
        process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
        process.env.CLOUDFRONT_STORAGE_URL = 'https://storage.troott.com';
    });

    afterAll(() => {
        process.env.CLOUDFRONT_STORAGE_URL = prev;
        process.env.NODE_ENV = prevEnv;
        process.env.AWS_STORAGE_BUCKET = prevBucket;
        process.env.AWS_REGION = prevRegion;
        process.env.AWS_ACCESS_KEY_ID = prevKey;
        process.env.AWS_SECRET_ACCESS_KEY = prevSecret;
    });

    it('builds CDN URL from s3 key', () => {
        expect(buildStoragePublicUrl('images/file-image-x')).toBe(
            'https://storage.troott.com/images/file-image-x',
        );
    });

    it('builds CDN URL from s3 key with file extension', () => {
        expect(
            buildStoragePublicUrl('images/file-image-2026-06-03-16-28-33.png'),
        ).toBe(
            'https://storage.troott.com/images/file-image-2026-06-03-16-28-33.png',
        );
    });

    it('buildS3ObjectKey appends extension from mime type', () => {
        expect(
            buildS3ObjectKey(
                'images',
                'file-image-2026-06-03-16-28-33',
                'image/png',
            ),
        ).toBe('images/file-image-2026-06-03-16-28-33.png');
    });

    it('buildS3ObjectKey prefers original filename extension', () => {
        expect(
            buildS3ObjectKey(
                'images',
                'file-image-2026-06-03-16-28-33',
                'image/jpeg',
                'cover.jpeg',
            ),
        ).toBe('images/file-image-2026-06-03-16-28-33.jpg');
    });

    it('extensionFromMimeType maps jpeg to jpg', () => {
        expect(extensionFromMimeType('image/jpeg')).toBe('jpg');
    });

    it('extensionFromMimeType maps audio/mpeg to mp3', () => {
        expect(extensionFromMimeType('audio/mpeg')).toBe('mp3');
    });

    it('buildS3ObjectKey appends extension for sermon audio originals', () => {
        expect(
            buildS3ObjectKey(
                'audio',
                'file-audio-2026-06-03-16-28-33',
                'audio/mpeg',
                'sermon.mp3',
            ),
        ).toBe('audio/file-audio-2026-06-03-16-28-33.mp3');
    });

    it('buildS3ObjectKey appends extension for PDF documents', () => {
        expect(
            buildS3ObjectKey(
                'documents',
                'file-document-2026-06-03-16-28-33',
                'application/pdf',
                'id.pdf',
            ),
        ).toBe('documents/file-document-2026-06-03-16-28-33.pdf');
    });

    it('builds image URL from uploadId', () => {
        expect(buildStorageImageUrl('file-image-x')).toBe(
            'https://storage.troott.com/images/file-image-x',
        );
    });

    it('maps S3 virtual-hosted URL to CDN', () => {
        expect(
            toStoragePublicUrl(
                'https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-2026-06-03-15-34-03',
            ),
        ).toBe(
            'https://storage.troott.com/images/file-image-2026-06-03-15-34-03',
        );
    });

    it('maps bare s3Key to CDN', () => {
        expect(
            toStoragePublicUrl('images/file-image-2026-06-03-15-34-03'),
        ).toBe(
            'https://storage.troott.com/images/file-image-2026-06-03-15-34-03',
        );
    });

    it('passes through static flag paths', () => {
        expect(toStoragePublicUrl('/images/flags/ng.svg')).toBe(
            '/images/flags/ng.svg',
        );
    });

    it('rewrites legacy sermon CDN path to images/', () => {
        expect(
            toStoragePublicUrl(
                'https://storage.troott.com/sermon/image/file-image-x',
            ),
        ).toBe('https://storage.troott.com/images/file-image-x');
    });

    it('strips cache-bust query before CDN mapping', () => {
        expect(
            toStoragePublicUrl(
                'https://storage.troott.com/images/file-image-x?v=2026-06-03T15%3A28%3A44.890Z',
            ),
        ).toBe('https://storage.troott.com/images/file-image-x');
    });

    it('normalizeStorageReferenceToS3Key maps CDN URL to images key', () => {
        expect(
            normalizeStorageReferenceToS3Key(
                'https://storage.troott.com/images/file-image-x?v=1',
            ),
        ).toBe('images/file-image-x');
    });

    it('normalizeStorageReferenceToS3Key maps raw S3 URL to images key', () => {
        expect(
            normalizeStorageReferenceToS3Key(
                'https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-x',
            ),
        ).toBe('images/file-image-x');
    });

    it('stripUrlQueryAndHash removes query and hash', () => {
        expect(stripUrlQueryAndHash('https://a.com/x?y=1#z')).toBe(
            'https://a.com/x',
        );
    });
});
