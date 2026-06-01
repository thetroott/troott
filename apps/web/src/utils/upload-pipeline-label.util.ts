import { UploadStatus } from '@/dtos/sermon-media.types';

/** Human label for `item.uploadStatus` on sermon detail (studio upload follow-up). */
export function formatUploadPipelineLabel(
    uploadStatus: string | undefined,
): string | null {
    switch (uploadStatus) {
        case UploadStatus.UPLOADED:
            return 'Upload received';
        case UploadStatus.EXTRACTING:
            return 'Extracting audio…';
        case UploadStatus.PROCESSING:
            return 'Processing audio…';
        case UploadStatus.COMPLETED:
            return 'Processing complete';
        case UploadStatus.FAILED:
            return 'Processing failed';
        default:
            return null;
    }
}
