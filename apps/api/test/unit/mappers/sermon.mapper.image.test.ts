import sermonMapper from '@/mappers/sermon.mapper';

describe('sermon.mapper sermon cover (feat-0015)', () => {
    const prevCdn = process.env.CLOUDFRONT_STORAGE_URL;
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
        process.env.CLOUDFRONT_STORAGE_URL = prevCdn;
        process.env.NODE_ENV = prevEnv;
        process.env.AWS_STORAGE_BUCKET = prevBucket;
        process.env.AWS_REGION = prevRegion;
        process.env.AWS_ACCESS_KEY_ID = prevKey;
        process.env.AWS_SECRET_ACCESS_KEY = prevSecret;
    });

    const s3Location =
        'https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-test.png';

    it('mapSermon CDN-maps imageUrl only, not image.item', async () => {
        const dto = await sermonMapper.mapSermon({
            _id: '507f1f77bcf86cd799439011',
            imageUrl: s3Location,
            image: {
                item: s3Location,
                width: 100,
                height: 100,
            },
        } as any);

        expect(dto.imageUrl).toBe(
            'https://storage.troott.com/images/file-image-test.png',
        );
        expect(dto.image?.item).toBe(s3Location);
    });

    it('mapUploadSermonImage uses imageUrl for file field', async () => {
        const dto = await sermonMapper.mapUploadSermonImage({
            imageUrl: s3Location,
            image: {
                item: s3Location,
                itemId: 'file-image-test',
                uploadedBy: 'user-1',
            },
        } as any);

        expect(dto.file).toBe(
            'https://storage.troott.com/images/file-image-test.png',
        );
        expect(dto.id).toBe('file-image-test');
    });
});
