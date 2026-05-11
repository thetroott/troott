import type { Request } from 'express';
import mongoose from 'mongoose';
import Minister from '@/models/minister.model';
import { getAuthUserId } from './auth-request.util';
import { isSermonPublicTeaserEligible } from './sermon-teaser.util';

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

/**
 * Public catalog (published, public, not deleted/broken) or the sermon’s minister account owner.
 */
export async function canAccessSermonDocument(
    req: Request,
    doc: Record<string, unknown>,
): Promise<boolean> {
    if (isSermonPublicTeaserEligible(doc)) {
        return true;
    }
    const userId = getAuthUserId(req);
    if (!userId) {
        return false;
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
