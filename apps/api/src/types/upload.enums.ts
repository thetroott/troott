export enum UploadStepType {
    IMAGE_UPLOADING = 'image-uploading',
    IMAGE_PROCESSED = 'image-processed',
    AUDIO_METADATA_PROCESSING = 'audio-metadata-processing',
    AUDIO_BITRATE_PROCESSING = 'audio-bitrate-processing',
    AUDIO_PROCESSED = 'audio-processed',
}

export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    EXPIRED = 'expired',
}

export enum ChunkStatus {
    PENDING = 'pending',
    UPLOADED = 'uploaded',
    FAILED = 'failed',
}

export enum ProcessingState {
    QUEUED = 'queued',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}
