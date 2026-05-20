import { describe, it, expect } from '@jest/globals';
import mongoose from 'mongoose';
import {
    isMongoObjectId,
    mongoIdFromDoc,
} from '@/utils/resolve-public-id.util';

describe('resolve-public-id.util', () => {
    describe('isMongoObjectId', () => {
        it('accepts a valid 24-hex ObjectId string', () => {
            const id = new mongoose.Types.ObjectId();
            expect(isMongoObjectId(id.toString())).toBe(true);
        });

        it('rejects minister-style public codes', () => {
            expect(isMongoObjectId('mn-2026-123456')).toBe(false);
        });

        it('rejects studio-style alphanumeric codes', () => {
            expect(isMongoObjectId('HEY4HTBEH12')).toBe(false);
        });

        it('rejects empty strings', () => {
            expect(isMongoObjectId('')).toBe(false);
            expect(isMongoObjectId('   ')).toBe(false);
        });
    });

    describe('mongoIdFromDoc', () => {
        it('reads _id and id from lean documents', () => {
            const oid = new mongoose.Types.ObjectId();
            expect(mongoIdFromDoc({ _id: oid })).toBe(String(oid));
            expect(mongoIdFromDoc({ id: 'abc' })).toBe('abc');
        });

        it('returns empty string for nullish input', () => {
            expect(mongoIdFromDoc(null)).toBe('');
            expect(mongoIdFromDoc(undefined)).toBe('');
        });
    });
});
