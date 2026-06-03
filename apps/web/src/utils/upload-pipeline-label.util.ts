import { UploadStatus } from '@/dtos/sermon-media.types';

/** Human label for `item.uploadStatus` on sermon detail (studio upload follow-up). */
export function formatUploadPipelineLabel(
    uploadStatus: string | undefined,
): string | null {
    switch (uploadStatus) {
        case UploadStatus.UPLOADED:
            return 'Uploaded...';
        case UploadStatus.EXTRACTING:
            return 'Processing...';
        case UploadStatus.PROCESSING:
            return 'Processing...';
        case UploadStatus.COMPLETED:
            return 'Processing complete';
        case UploadStatus.FAILED:
            return 'Processing failed';
        case UploadStatus.CANCELLED:
            return 'Processing cancelled';
        default:
            return null;
    }
}
