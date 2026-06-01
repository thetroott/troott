/** Stable identity for a browser `File` (feat-0008 single-flight). */
export function buildSermonUploadFileSignature(file: File): string {
    return `${file.name}|${file.size}|${file.lastModified}`;
}

export type SermonUploadStartGateInput = {
    fileSignature: string | null;
    uploadComplete: boolean;
    uploadError: boolean;
    startedForSignature: string | null;
};

/** Whether the progress-step effect should skip starting `start-upload`. */
export function shouldSkipSermonUploadStart(
    input: SermonUploadStartGateInput,
): boolean {
    if (!input.fileSignature) {
        return true;
    }
    if (input.uploadComplete || input.uploadError) {
        return true;
    }
    if (input.startedForSignature === input.fileSignature) {
        return true;
    }
    return false;
}
