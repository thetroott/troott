import mongoose from 'mongoose';
import type { IResult } from '@/interfaces/common.interface';
import { StudioRole } from '@/interfaces/core/studio.interface';
import studioRepository from '@/repository/core/studio.repository';
import { getUserStudioRole } from '@/services/core/studio.service';
import type IStudioDoc from '@/interfaces/core/studio.interface';
import Minister from '@/models/core/minister.model';

const WRITE_ROLES: StudioRole[] = [
    StudioRole.OWNER,
    StudioRole.ADMIN,
    StudioRole.EDITOR,
    StudioRole.UPLOADER,
];

function oid(v: unknown): string {
    if (v == null) return '';
    if (typeof v === 'object' && '_id' in (v as object)) {
        return String((v as { _id: unknown })._id);
    }
    return String(v);
}

/**
 * When any linked minister has a studio, the user must be a studio member
 * with a write-capable role to mutate that sermon.
 */
export async function assertStudioWriteForSermonMinisters(
    userId: string,
    ministerRefs: unknown,
): Promise<IResult> {
    const ok: IResult = {
        error: false,
        message: '',
        code: 200,
        data: {},
    };
    if (!userId || !ministerRefs) return ok;

    const ids: string[] = Array.isArray(ministerRefs)
        ? ministerRefs.map(oid).filter(Boolean)
        : [oid(ministerRefs)].filter(Boolean);

    const studioIds = new Set<string>();
    for (const mid of ids) {
        if (!mongoose.Types.ObjectId.isValid(mid)) continue;
        const m = await Minister.findById(mid).select('studio').lean();
        if (m && (m as { studio?: unknown }).studio) {
            studioIds.add(oid((m as { studio: unknown }).studio));
        }
    }
    if (studioIds.size === 0) return ok;

    for (const sid of studioIds) {
        const r = await studioRepository.findStudioById(sid, false);
        if (r.error || !r.data) continue;
        const studio = r.data as IStudioDoc;
        const role = getUserStudioRole(studio, userId);
        if (role && WRITE_ROLES.includes(role)) {
            return ok;
        }
    }

    return {
        error: true,
        code: 403,
        message:
            'You do not have permission to edit content for this studio channel',
        data: {},
    };
}
