import { ContentState } from '@/types/common.enum';
import { MediaStatus } from '@/interfaces/core/sermon.interface';
import type { Request } from 'express';
import mongoose from 'mongoose';
import Minister from '@/models/core/minister.model';
import { getAuthUserId } from './auth-request.util';

function ministerIdFromDoc(minister: unknown): string {
    if (minister == null) {
        return '';
    }
    if (
        typeof minister === 'object' &&
        minister !== null &&
        '_id' in minister
    ) {
        return String((minister as { _id: unknown })._id);
    }
    return String(minister);
}

function isPublishedCatalogSermon(doc: Record<string, unknown>): boolean {
    if (doc.isPublic === false) {
        return false;
    }
    if (doc.status !== MediaStatus.PUBLISHED) {
        return false;
    }
    const st = doc.state;
    if (st === ContentState.DELETED || st === ContentState.BROKEN) {
        return false;
    }
    return true;
}

/**
 * Published catalog sermon for signed-in listeners, or the sermon minister owner.
 */
export async function canAccessSermonDocument(
    req: Request,
    doc: Record<string, unknown>,
): Promise<boolean> {
    const userId = getAuthUserId(req);
    if (!userId) {
        return false;
    }

    if (isPublishedCatalogSermon(doc)) {
        return true;
    }

    const mid = ministerIdFromDoc(doc.minister);
    if (!mid || !mongoose.Types.ObjectId.isValid(mid)) {
        return false;
    }
    const owned = await Minister.findOne({
        _id: new mongoose.Types.ObjectId(mid),
        user: new mongoose.Types.ObjectId(userId),
    })
        .select('_id')
        .lean();
    return !!owned;
}
