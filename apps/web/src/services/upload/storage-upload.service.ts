import type { AxiosResponse } from 'axios';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import type { UppyFile } from '@uppy/core';

import api from '@/api/config';

const S3_MULTIPART_THRESHOLD_BYTES = 6 * 1024 * 1024;

export type StorageUploadResult = {
    fileName: string;
    s3Key: string;
    url?: string;
};

type TroottMeta = {
    sessionId?: string;
};

function unwrapEnvelope<T>(res: AxiosResponse<{ data?: T }>): T {
    const payload = res.data?.data;
    if (!payload) {
        throw new Error('Invalid API response');
    }
    return payload;
}

async function uploadStorageViaS3(
    file: File,
    purpose: 'storage-image' | 'storage-document',
    onProgress?: (percent: number) => void,
): Promise<StorageUploadResult> {
    const uppy = new Uppy({ restrictions: { maxNumberOfFiles: 1 } });

    uppy.use(AwsS3, {
        shouldUseMultipart: () => true,
        createMultipartUpload: async (uppyFile: UppyFile) => {
            const res = await api.storage.createStorageMultipart({
                filename: file.name,
                contentType: file.type || 'application/octet-stream',
                contentLength: file.size,
                purpose,
            });
            const data = unwrapEnvelope<{
                sessionId: string;
                key: string;
                s3UploadId: string;
            }>(res);
            (uppyFile.meta as TroottMeta).sessionId = data.sessionId;
            return { uploadId: data.s3UploadId, key: data.key };
        },
        signPart: async (uppyFile, partData) => {
            const meta = uppyFile.meta as TroottMeta;
            const res = await api.storage.signStoragePart({
                sessionId: String(meta.sessionId),
                partNumber: partData.partNumber,
            });
            const data = unwrapEnvelope<{ url: string; headers?: Record<string, string> }>(
                res,
            );
            return { url: data.url, headers: data.headers ?? {} };
        },
        listParts: async (uppyFile) => {
            const meta = uppyFile.meta as TroottMeta;
            const res = await api.storage.listStorageParts(String(meta.sessionId));
            const data = unwrapEnvelope<{
                parts: Array<{ partNumber: number; size: number; etag: string }>;
            }>(res);
            return {
                parts: data.parts.map((p) => ({
                    PartNumber: p.partNumber,
                    Size: p.size,
                    ETag: p.etag,
                })),
            };
        },
        completeMultipartUpload: async (uppyFile, { parts }) => {
            const meta = uppyFile.meta as TroottMeta;
            const res = await api.storage.completeStorageMultipart({
                sessionId: String(meta.sessionId),
                parts: parts.map((p) => ({
                    partNumber: p.PartNumber ?? 0,
                    etag: String(p.ETag ?? ''),
                })),
            });
            (uppyFile.meta as TroottMeta & {
                completeDto?: { file?: string; s3Key?: string; fileName?: string };
            }).completeDto = unwrapEnvelope(res) as {
                file?: string;
                s3Key?: string;
                fileName?: string;
            };
        },
        abortMultipartUpload: async (uppyFile) => {
            const meta = uppyFile.meta as TroottMeta;
            if (meta.sessionId) {
                await api.storage.abortStorageMultipart({
                    sessionId: String(meta.sessionId),
                });
            }
        },
    });

    uppy.on('upload-progress', (_file, progress) => {
        const total = progress.bytesTotal ?? file.size;
        if (total > 0 && onProgress) {
            onProgress(
                Math.min(100, Math.round((progress.bytesUploaded / total) * 100)),
            );
        }
    });

    uppy.addFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: file,
    });

    const result = await uppy.upload();
    uppy.destroy();

    if (result.failed.length > 0) {
        throw new Error(result.failed[0]?.error ?? 'Storage upload failed');
    }

    const uploaded = result.successful[0];
    const dto = (
        uploaded?.meta as TroottMeta & {
            completeDto?: { file?: string; s3Key?: string; fileName?: string };
        }
    )?.completeDto;

    if (!dto?.s3Key) {
        throw new Error('Storage upload succeeded but no s3Key returned');
    }

    return {
        fileName: dto.fileName ?? file.name,
        s3Key: dto.s3Key,
        url: dto.file,
    };
}

/**
 * Upload image or document to troott-storage (S3 multipart when >6 MB).
 */
export async function uploadStorageFile(
    file: File,
    opts?: {
        purpose?: 'storage-image' | 'storage-document';
        onProgress?: (percent: number) => void;
    },
): Promise<StorageUploadResult> {
    const purpose =
        opts?.purpose ??
        (file.type === 'application/pdf' ? 'storage-document' : 'storage-image');

    if (file.size > S3_MULTIPART_THRESHOLD_BYTES) {
        return uploadStorageViaS3(file, purpose, opts?.onProgress);
    }

    const res =
        purpose === 'storage-document'
            ? await api.storage.uploadDocument(file, opts?.onProgress)
            : await api.storage.uploadImage(file, opts?.onProgress);
    const envelope = res.data as { data?: Record<string, unknown> };
    const dto = envelope?.data ?? (res.data as Record<string, unknown>);
    const s3Key = typeof dto.s3Key === 'string' ? dto.s3Key : '';
    if (!s3Key) {
        throw new Error('Upload failed');
    }
    return {
        fileName:
            typeof dto.fileName === 'string' ? dto.fileName : file.name,
        s3Key,
        url: typeof dto.file === 'string' ? dto.file : undefined,
    };
}
