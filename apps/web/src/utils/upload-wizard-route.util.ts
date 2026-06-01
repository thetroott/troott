import {
    PATH_SEG_SERMONS_UPLOAD,
    PATH_SEG_SERMONS_UPLOAD_DETAILS,
    PATH_SEG_SERMONS_UPLOAD_FILE,
    PATH_SEG_SERMONS_UPLOAD_PUBLISH,
    PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
    type StudioUploadSegment,
} from '@/routes/paths';

export type UploadWizardStepKey =
    | 'progress'
    | 'details'
    | 'settings'
    | 'review';

/** Map studio upload URL segment to upload context step key. */
export function uploadStepFromPathname(pathname: string): UploadWizardStepKey {
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_PUBLISH}`)) {
        return 'review';
    }
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_THUMBNAIL}`)) {
        return 'settings';
    }
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_DETAILS}`)) {
        return 'details';
    }
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_FILE}`)) {
        return 'progress';
    }
    if (pathname.endsWith(`/${PATH_SEG_SERMONS_UPLOAD}`)) {
        return 'progress';
    }
    return 'progress';
}

/** Map wizard tab step to studio upload route segment (feat-0018 URL sync). */
export function uploadPathSegmentFromStep(
    step: string,
): StudioUploadSegment {
    switch (step) {
        case 'details':
            return PATH_SEG_SERMONS_UPLOAD_DETAILS;
        case 'settings':
            return PATH_SEG_SERMONS_UPLOAD_THUMBNAIL;
        case 'review':
            return PATH_SEG_SERMONS_UPLOAD_PUBLISH;
        case 'progress':
        default:
            return PATH_SEG_SERMONS_UPLOAD_FILE;
    }
}
