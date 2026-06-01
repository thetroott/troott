import {
    PATH_SEG_SERMONS_UPLOAD_DETAILS,
    PATH_SEG_SERMONS_UPLOAD_FILE,
    PATH_SEG_SERMONS_UPLOAD_PUBLISH,
    PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
} from '@/routes/paths';

/** Map studio upload URL segment to upload context step key. */
export function uploadStepFromPathname(pathname: string): string {
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_PUBLISH}`)) {
        return 'review';
    }
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_THUMBNAIL}`)) {
        return 'details';
    }
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_DETAILS}`)) {
        return 'details';
    }
    if (pathname.includes(`/${PATH_SEG_SERMONS_UPLOAD_FILE}`)) {
        return 'progress';
    }
    return 'progress';
}
