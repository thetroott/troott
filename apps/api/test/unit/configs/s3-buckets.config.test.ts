import {
    bucketNameFor,
    inferBucketRoleFromKey,
} from '@/configs/s3-buckets.config';

describe('s3-buckets.config', () => {
    const env = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...env };
        process.env.AWS_BUCKET_NAME = 'legacy-bucket';
        delete process.env.AWS_ORIGINALS_BUCKET;
        delete process.env.AWS_PLAYBACK_BUCKET;
        delete process.env.AWS_STORAGE_BUCKET;
    });

    afterAll(() => {
        process.env = env;
    });

    it('falls back to legacy bucket when split env is unset', async () => {
        const mod = await import('@/configs/s3-buckets.config');
        expect(mod.bucketNameFor('originals')).toBe('legacy-bucket');
        expect(mod.bucketNameFor('playback')).toBe('legacy-bucket');
        expect(mod.bucketNameFor('storage')).toBe('legacy-bucket');
    });

    it('uses split bucket env when set', async () => {
        process.env.AWS_ORIGINALS_BUCKET = 'troott-originals';
        process.env.AWS_PLAYBACK_BUCKET = 'troott-playback';
        process.env.AWS_STORAGE_BUCKET = 'troott-storage';
        jest.resetModules();
        const mod = await import('@/configs/s3-buckets.config');
        expect(mod.bucketNameFor('originals')).toBe('troott-originals');
        expect(mod.bucketNameFor('playback')).toBe('troott-playback');
        expect(mod.bucketNameFor('storage')).toBe('troott-storage');
        expect(mod.s3BucketsConfig.usesSplitBuckets).toBe(true);
    });

    it('infers bucket role from key prefix', async () => {
        const mod = await import('@/configs/s3-buckets.config');
        expect(mod.inferBucketRoleFromKey('audio/abc-123')).toBe('originals');
        expect(mod.inferBucketRoleFromKey('uuid/hls/low/seg_001.ts')).toBe(
            'playback',
        );
        expect(mod.inferBucketRoleFromKey('uuid/hls/master.m3u8')).toBe(
            'playback',
        );
        expect(mod.inferBucketRoleFromKey('images/avatar-1')).toBe('storage');
    });
});
