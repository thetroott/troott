import type { AxiosResponse } from 'axios';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import type { UppyFile } from '@uppy/core';

import api from '@/api/config';

const S3_MULTIPART_THRESHOLD_BYTES = 6 * 1024 * 1024;
const RESUME_STORAGE_KEY = 'troott:s3-multipart:v1';

export type StartSermonAudioUploadParams = {
    file: File;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
    /** Test-only: legacy `start-upload` when file is ≤6 MB */
    forceLegacy?: boolean;
};

export type StartSermonAudioUploadResult = {
    sermonId: string;
    uploadRef?: string;
};

type TroottMeta = {
    sessionId?: string;
    troottUploadId?: string;
    troottCompleteResponse?: Record<string, unknown>;
};

function unwrapEnvelope<T>(res: AxiosResponse<{ data?: T }>): T {
    const payload = res.data?.data;
    if (!payload) {
        throw new Error('Invalid API response');
    }
    return payload;
}

function parseSermonComplete(
    payload: Record<string, unknown>,
): StartSermonAudioUploadResult {
    const sermonId =
        typeof payload.id === 'string'
            ? payload.id
            : typeof payload._id === 'string'
              ? payload._id
              : '';
    if (!sermonId) {
        throw new Error('Upload response did not include a sermon id.');
    }
    const item = payload.item as { itemId?: string } | undefined;
    const uploadRef =
        (typeof payload.uploadRef === 'string' && payload.uploadRef.trim()) ||
        item?.itemId?.trim() ||
        undefined;
    return { sermonId, uploadRef };
}

function fileResumeKey(file: File): string {
    return `${file.name}|${file.size}|${file.lastModified}`;
}

function readResumeSession(file: File): string | null {
    try {
        const raw = localStorage.getItem(RESUME_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as {
            fileSignature?: string;
            sessionId?: string;
            createdAt?: number;
        };
        if (parsed.fileSignature !== fileResumeKey(file)) return null;
        if (!parsed.sessionId) return null;
        if (parsed.createdAt && Date.now() - parsed.createdAt > 24 * 3600 * 1000) {
            localStorage.removeItem(RESUME_STORAGE_KEY);
            return null;
        }
        return parsed.sessionId;
    } catch {
        return null;
    }
}

function writeResumeSession(file: File, sessionId: string) {
    localStorage.setItem(
        RESUME_STORAGE_KEY,
        JSON.stringify({
            fileSignature: fileResumeKey(file),
            sessionId,
            createdAt: Date.now(),
        }),
    );
}

function clearResumeSession() {
    localStorage.removeItem(RESUME_STORAGE_KEY);
}

async function uploadSermonAudioViaS3(
    params: StartSermonAudioUploadParams,
): Promise<StartSermonAudioUploadResult> {
    const { file, onProgress, signal } = params;
    let sessionIdForAbort: string | undefined;

    const uppy = new Uppy({ restrictions: { maxNumberOfFiles: 1 } });

    uppy.use(AwsS3, {
        shouldUseMultipart: () => true,
        createMultipartUpload: async (uppyFile: UppyFile) => {
            const res = await api.sermon.createSermonAudioMultipart({
                filename: file.name,
                contentType: file.type || 'application/octet-stream',
                contentLength: file.size,
            });
            const data = unwrapEnvelope<{
                sessionId: string;
                uploadId: string;
                key: string;
                s3UploadId: string;
            }>(res);
            const meta = uppyFile.meta as TroottMeta;
            meta.sessionId = data.sessionId;
            meta.troottUploadId = data.uploadId;
            sessionIdForAbort = data.sessionId;
            writeResumeSession(file, data.sessionId);
            return { uploadId: data.s3UploadId, key: data.key };
        },
        signPart: async (uppyFile, partData) => {
            const meta = uppyFile.meta as TroottMeta;
            const res = await api.sermon.signSermonAudioPart({
                sessionId: String(meta.sessionId),
                partNumber: partData.partNumber,
            });
            const data = unwrapEnvelope<{ url: string; headers?: Record<string, string> }>(
                res,
            );
            return { url: data.url, headers: data.headers ?? {} };
        },
        listParts: async (uppyFile, { uploadId, key }) => {
            const meta = uppyFile.meta as TroottMeta;
            const res = await api.sermon.listSermonAudioParts(
                String(meta.sessionId),
            );
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
            const res = await api.sermon.completeSermonAudioMultipart({
                sessionId: String(meta.sessionId),
                parts: parts.map((p) => ({
                    partNumber: p.PartNumber ?? 0,
                    etag: String(p.ETag ?? ''),
                })),
            });
            meta.troottCompleteResponse = unwrapEnvelope(res) as Record<
                string,
                unknown
            >;
        },
        abortMultipartUpload: async (uppyFile) => {
            const meta = uppyFile.meta as TroottMeta;
            if (meta.sessionId) {
                await api.sermon.abortSermonAudioMultipart({
                    sessionId: String(meta.sessionId),
                });
            }
            clearResumeSession();
        },
    });

    const onAbort = () => {
        void uppy.cancelAll();
        if (sessionIdForAbort) {
            void api.sermon.abortSermonAudioMultipart({
                sessionId: sessionIdForAbort,
            });
        }
        clearResumeSession();
    };
    signal?.addEventListener('abort', onAbort);

    uppy.on('upload-progress', (_file, progress) => {
        const total = progress.bytesTotal ?? file.size;
        if (total > 0 && onProgress) {
            onProgress(
                Math.min(100, Math.round((progress.bytesUploaded / total) * 100)),
            );
        }
    });

    const existingSessionId = readResumeSession(file);
    if (existingSessionId) {
        (uppy as Uppy).setMeta({ resumeSessionId: existingSessionId });
    }

    uppy.addFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: file,
        meta: existingSessionId ? { sessionId: existingSessionId } : {},
    });

    try {
        const result = await uppy.upload();
        if (result.failed.length > 0) {
            throw new Error(
                result.failed[0]?.error ?? 'Sermon audio upload failed',
            );
        }
        const uploaded = result.successful[0];
        const completePayload = (uploaded?.meta as TroottMeta)
            ?.troottCompleteResponse;
        if (!completePayload) {
            throw new Error('Upload completed without sermon response');
        }
        clearResumeSession();
        return parseSermonComplete(completePayload);
    } finally {
        signal?.removeEventListener('abort', onAbort);
        uppy.destroy();
    }
}

/**
 * Minister sermon audio upload — direct S3 multipart (default) or legacy API multipart.
 */
export async function startSermonAudioUpload(
    params: StartSermonAudioUploadParams,
): Promise<StartSermonAudioUploadResult> {
    const { file, onProgress, signal, forceLegacy } = params;

    if (forceLegacy && file.size <= S3_MULTIPART_THRESHOLD_BYTES) {
        const formData = new FormData();
        formData.append('file', file);
        const res = (await api.sermon.startUpload(
            formData,
            onProgress,
            signal,
        )) as AxiosResponse<{
            data?: {
                id?: string;
                uploadRef?: string;
                item?: { itemId?: string };
            };
        }>;
        const payload = res.data?.data;
        if (!payload?.id) {
            throw new Error('Upload response did not include a sermon id.');
        }
        const uploadRef =
            payload.uploadRef?.trim() ||
            payload.item?.itemId?.trim() ||
            undefined;
        return { sermonId: payload.id, uploadRef };
    }

    return uploadSermonAudioViaS3(params);
}
