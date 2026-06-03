import type { NavigateFunction, NavigateOptions } from 'react-router-dom';
import {
    PATH_SEG_SERMONS_UPLOAD_FILE,
    studioSermonEditPath,
    studioUploadPath,
} from '@/routes/paths';
import { isSermonDraftDocument } from '@/utils/sermon-info-map.util';

export type SermonEditResumeState = {
    resumeSermonId: string;
    editMode?: boolean;
};

export type SermonEditDestination =
    | {
          kind: 'upload-wizard';
          path: string;
          state: SermonEditResumeState;
      }
    | {
          kind: 'sermon-details';
          path: string;
      };

export function isSermonDraftFromListRow(row?: {
    publicationStatus?: string;
}): boolean {
    return row?.publicationStatus === 'draft';
}

/**
 * feat-0025: draft → upload wizard; published → Sermon details `/edit`.
 */
export function resolveSermonEditDestination(
    studioCode: string,
    sermonId: string,
    opts?: {
        isDraft?: boolean;
        doc?: Record<string, unknown>;
    },
): SermonEditDestination {
    const trimmedCode = studioCode.trim();
    const trimmedId = sermonId.trim();
    const isDraft =
        opts?.isDraft === true ||
        (opts?.doc != null && isSermonDraftDocument(opts.doc));

    if (isDraft) {
        return {
            kind: 'upload-wizard',
            path: studioUploadPath(trimmedCode, PATH_SEG_SERMONS_UPLOAD_FILE),
            state: { resumeSermonId: trimmedId, editMode: true },
        };
    }

    return {
        kind: 'sermon-details',
        path: studioSermonEditPath(trimmedCode, trimmedId),
    };
}

export function navigateOnSermonEdit(
    navigate: NavigateFunction,
    studioCode: string,
    sermonId: string,
    opts?: {
        isDraft?: boolean;
        doc?: Record<string, unknown>;
        replace?: boolean;
    },
): void {
    const dest = resolveSermonEditDestination(studioCode, sermonId, opts);
    const replace = opts?.replace === true;

    if (dest.kind === 'upload-wizard') {
        const navOpts: NavigateOptions = {
            state: dest.state,
            ...(replace ? { replace: true } : {}),
        };
        navigate(dest.path, navOpts);
        return;
    }

    navigate(dest.path, replace ? { replace: true } : undefined);
}
